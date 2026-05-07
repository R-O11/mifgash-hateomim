const pool = require('../config/db');

class OrderService {
  /**
   * Generates a readable daily sequential order number (e.g. MH-20260403-0001)
   */
  async generateOrderNumber(client) {
    const today = new Date();
    // Format YYYYMMDD cleanly (local timezone mapping)
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `MH-${yyyy}${mm}${dd}`;

    // Select the last order of today (FOR UPDATE locks the row to prevent race conditions)
    const [rows] = await client.query(
      `SELECT order_number FROM orders 
       WHERE order_number LIKE ? 
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [`${datePrefix}-%`]
    );

    let nextSequence = 1;

    if (rows.length > 0) {
      const lastOrderNumber = rows[0].order_number;
      const parts = lastOrderNumber.split('-');
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }

    const sequenceStr = String(nextSequence).padStart(4, '0');
    return `${datePrefix}-${sequenceStr}`;
  }

  /**
   * Validates and calculates properties of an order server-side,
   * then persists via a robust transaction.
   */
  async createOrder(payload) {
    const client = await pool.getConnection();

    try {
      await client.query('BEGIN');

      // 1. Basic properties extraction & default fallbacks
      const {
        customer_name,
        customer_phone,
        notes = null,
        theme_lang = 'he', // Usually matches frontend language
        order_type, // 'pickup' | 'delivery'
        payment_method = 'cash',
        items = [], // Array of objects: { productId, quantity, notes, options: [{ groupId, itemId }] }
      } = payload;

      const payment_status = payment_method === 'cash' ? 'unpaid' : 'pending';

      let subtotal = 0;
      const dbOrderItems = [];

      // 2. Iterate each requested product to find true price in DB
      for (const item of items) {
        // Fetch product
        const [prodRows] = await client.query(
          `SELECT id, name_he, name_ar, base_price, is_available 
           FROM products WHERE id = ? AND is_active = true`,
          [item.productId]
        );

        if (prodRows.length === 0) {
          throw new Error(`Product ID ${item.productId} is invalid or inactive.`);
        }
        const product = prodRows[0];
        
        if (!product.is_available) {
          throw new Error(`Product '${product.name_he}' is currently unavailable.`);
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product ${item.productId}`);
        }

        let itemTotal = Number(product.base_price);
        const dbOptions = [];

        // Fetch ALL groups for this product ahead of validation
        const [groupRows] = await client.query(
          `SELECT id, name_he, name_ar, min_select, max_select, is_required
           FROM option_groups WHERE product_id = ? AND is_active = true`,
          [product.id]
        );

        // Group counts map
        const groupSelectionCounts = {};
        groupRows.forEach(g => {
          groupSelectionCounts[g.id] = 0;
        });

        // 3. Process options for the item
        if (item.options && Array.isArray(item.options)) {
          for (const opt of item.options) {
            const [optItemRows] = await client.query(
              `SELECT id, group_id, name_he, name_ar, price_change 
               FROM option_items WHERE id = ? AND is_active = true`,
              [opt.itemId]
            );

            if (optItemRows.length === 0) {
              throw new Error(`Option Item ID ${opt.itemId} is invalid.`);
            }
            const dbOpt = optItemRows[0];

            // Validate the item belongs to a group of THIS product and matches logic
            const groupDef = groupRows.find(g => g.id === dbOpt.group_id);
            if (!groupDef) {
              throw new Error(`Option mismatch: Item ${dbOpt.name_he} does not belong to product ${product.name_he}.`);
            }

            groupSelectionCounts[groupDef.id] += 1;
            itemTotal += Number(dbOpt.price_change);

            dbOptions.push({
               group_name_he: groupDef.name_he,
               group_name_ar: groupDef.name_ar,
               option_name_he: dbOpt.name_he,
               option_name_ar: dbOpt.name_ar,
               price_change: Number(dbOpt.price_change)
            });
          }
        }

        // Validate option groups (min/max selection logic)
        for (const g of groupRows) {
          const count = groupSelectionCounts[g.id];
          if (g.is_required && count < g.min_select) {
            throw new Error(`Product ${product.name_he}: You must select at least ${g.min_select} from group '${g.name_he}'.`);
          }
          if (count > g.max_select) {
            throw new Error(`Product ${product.name_he}: You selected too many items from group '${g.name_he}'. Maximum is ${g.max_select}.`);
          }
        }

        itemTotal = itemTotal * quantity;
        subtotal += itemTotal;

        dbOrderItems.push({
          product_id: product.id,
          product_name_he: product.name_he,
          product_name_ar: product.name_ar,
          base_price: product.base_price,
          quantity: quantity,
          item_total: itemTotal,
          notes: item.notes || null,
          options: dbOptions
        });
      }

      // 4. Final totals integration (Rules state free delivery)
      const delivery_fee = 0.00;
      const total_amount = subtotal + delivery_fee;

      // Generate Order Number
      const order_number = await this.generateOrderNumber(client);

      // Insert Order
      const [orderResult] = await client.query(
        `INSERT INTO orders (
           order_number, order_type, customer_name, customer_phone, notes, language, 
           subtotal, delivery_fee, total_amount, payment_method, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          order_number, order_type, customer_name, customer_phone, notes, theme_lang,
          subtotal, delivery_fee, total_amount, payment_method, payment_status
        ]
      );

      const orderId = orderResult.insertId;

      // Insert Items
      for (const item of dbOrderItems) {
        const [itemResult] = await client.query(
          `INSERT INTO order_items (
             order_id, product_id, product_name_he, product_name_ar, 
             base_price, quantity, item_total, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
             orderId, item.product_id, item.product_name_he, item.product_name_ar,
             item.base_price, item.quantity, item.item_total, item.notes
          ]
        );

        const orderItemId = itemResult.insertId;

        // Insert Item Options
        for (const opt of item.options) {
           await client.query(
             `INSERT INTO order_item_options (
                order_item_id, group_name_he, group_name_ar, option_name_he, option_name_ar, price_change
             ) VALUES (?, ?, ?, ?, ?, ?)`,
             [
               orderItemId, opt.group_name_he, opt.group_name_ar, opt.option_name_he, opt.option_name_ar, opt.price_change
             ]
           );
        }
      }

      await client.query('COMMIT');
      client.release();

      return {
        success: true,
        orderId,
        orderNumber: order_number,
        totalAmount: total_amount
      };

    } catch (error) {
       await client.query('ROLLBACK');
       client.release();
       throw error;
    }
  }

  /**
   * Fetches order status and basic details for tracking by order number.
   * Safe for public fetching (only returns non-sensitive data).
   */
  async getOrderForTracking(orderNumber) {
    const [rows] = await pool.query(
      `SELECT order_number, order_status, created_at, total_amount, order_type 
       FROM orders WHERE order_number = ? LIMIT 1`,
      [orderNumber]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }
}

module.exports = new OrderService();
