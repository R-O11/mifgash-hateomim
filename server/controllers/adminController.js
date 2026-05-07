const pool = require('../config/db');

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    // Left join order items and options to construct full payloads
    const [orderRows] = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`
    );

    if (orderRows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const orderIds = orderRows.map(o => o.id);

    const [itemRows] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    const itemIds = itemRows.length > 0 ? itemRows.map(i => i.id) : [];

    let optionRows = [];
    if (itemIds.length > 0) {
      const [optRows] = await pool.query(
        `SELECT * FROM order_item_options WHERE order_item_id IN (?)`,
        [itemIds]
      );
      optionRows = optRows;
    }

    const compiledOrders = orderRows.map(order => {
      const dbItems = itemRows.filter(i => i.order_id === order.id);
      const itemsWithOptions = dbItems.map(item => ({
        ...item,
        options: optionRows.filter(opt => opt.order_item_id === item.id)
      }));

      return {
        ...order,
        items: itemsWithOptions
      };
    });

    res.status(200).json({ success: true, data: compiledOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const [result] = await pool.query(
      `UPDATE orders SET order_status = ? WHERE id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, message: 'Order status updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get business settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM business_settings LIMIT 1`
    );
    const data = rows.length > 0 ? rows[0] : { manual_override_mode: 'auto' };
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    // 1. Orders Today
    const [ordersTodayResult] = await pool.query(
      `SELECT COUNT(id) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE AND order_status != 'cancelled'`
    );
    const ordersToday = parseInt(ordersTodayResult[0].count, 10);

    // 2. Revenue Today
    const [revenueTodayResult] = await pool.query(
      `SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND order_status != 'cancelled'`
    );
    const revenueToday = revenueTodayResult[0].total || 0;

    // 3. Active Products
    const [activeProductsResult] = await pool.query(
      `SELECT COUNT(id) as count FROM products WHERE is_active = true`
    );
    const activeProducts = parseInt(activeProductsResult[0].count, 10);

    // 4. Avg Order Value Today
    const avgOrderValue = ordersToday > 0 ? (revenueToday / ordersToday).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        ordersToday,
        revenueToday,
        activeProducts,
        avgOrderValue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update manual override mode
// @route   PATCH /api/admin/settings/manual-override
// @access  Private/Admin
const updateOverrideMode = async (req, res, next) => {
  try {
    const { mode } = req.body;
    const allowedModes = ['auto', 'force_open', 'force_closed'];

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid mode provided.' });
    }

    await pool.query(
      `UPDATE business_settings SET manual_override_mode = ?`,
      [mode]
    );

    res.status(200).json({ success: true, message: `Override mode set to ${mode}` });
  } catch (error) {
    next(error);
  }
};



// @desc    Update menu mode (menu only vs ordering)
// @route   PATCH /api/admin/settings/menu-mode
// @access  Private/Admin
const updateMenuMode = async (req, res, next) => {
  try {
    const { menu_mode } = req.body;
    const value = menu_mode ? true : false;
    await pool.query('UPDATE business_settings SET menu_mode = ?', [value]);
    res.status(200).json({ success: true, message: `Menu mode set to ${value ? 'menu_only' : 'ordering'}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business info (address, phone, coordinates)
// @route   PATCH /api/admin/settings/info
// @access  Private/Admin
const updateBusinessInfo = async (req, res, next) => {
  try {
    const { phone_number, whatsapp_number, address_he, address_ar, lat, lng } = req.body;
    await pool.query(
      `UPDATE business_settings SET 
        phone_number = ?, 
        whatsapp_number = ?, 
        address_he = ?, 
        address_ar = ?, 
        lat = ?, 
        lng = ?`
      , [phone_number, whatsapp_number, address_he, address_ar, lat, lng]
    );
    res.status(200).json({ success: true, message: 'Business info updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name_he AS category_name_he, c.name_ar AS category_name_ar 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { category_id, name_he, name_ar, description_he, description_ar, base_price, is_active, is_available, is_recommended, prep_time_minutes } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/images/${req.file.filename}`;
    }

    const activeVal = !(is_active === 'false' || is_active === false);
    const availVal = !(is_available === 'false' || is_available === false);
    const recommVal = (is_recommended === 'true' || is_recommended === true || is_recommended === 1 || is_recommended === '1');
    const prepTimeVal = prep_time_minutes ? parseInt(prep_time_minutes, 10) : null;

    const [result] = await pool.query(
      `INSERT INTO products 
       (category_id, name_he, name_ar, description_he, description_ar, base_price, prep_time_minutes, image_url, is_active, is_available, is_recommended) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name_he, name_ar,
        description_he || null, description_ar || null,
        base_price, prepTimeVal, image_url,
        activeVal, availVal, recommVal
      ]
    );

    res.status(201).json({ success: true, message: 'Product created', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { category_id, name_he, name_ar, description_he, description_ar, base_price, is_active, is_available, is_recommended, prep_time_minutes } = req.body;

    let image_url = undefined;
    if (req.file) {
      image_url = `/images/${req.file.filename}`;
    }

    const activeVal = !(is_active === 'false' || is_active === false || is_active === 0 || is_active === '0');
    const availVal = !(is_available === 'false' || is_available === false || is_available === 0 || is_available === '0');
    const recommVal = (is_recommended === 'true' || is_recommended === true || is_recommended === 1 || is_recommended === '1');
    const prepTimeVal = prep_time_minutes ? parseInt(prep_time_minutes, 10) : null;

    if (image_url !== undefined) {
      await pool.query(
        `UPDATE products SET 
         category_id = ?, name_he = ?, name_ar = ?, 
         description_he = ?, description_ar = ?, base_price = ?, prep_time_minutes = ?,
         is_active = ?, is_available = ?, is_recommended = ?,
         image_url = ?
         WHERE id = ?`,
        [
          category_id, name_he, name_ar,
          description_he || null, description_ar || null,
          base_price, prepTimeVal, activeVal, availVal, recommVal,
          image_url, productId
        ]
      );
    } else {
      await pool.query(
        `UPDATE products SET 
         category_id = ?, name_he = ?, name_ar = ?, 
         description_he = ?, description_ar = ?, base_price = ?, prep_time_minutes = ?,
         is_active = ?, is_available = ?, is_recommended = ?
         WHERE id = ?`,
        [
          category_id, name_he, name_ar,
          description_he || null, description_ar || null,
          base_price, prepTimeVal, activeVal, availVal, recommVal,
          productId
        ]
      );
    }

    res.status(200).json({ success: true, message: 'Product updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product availability
// @route   PATCH /api/admin/products/:id/toggle
// @access  Private/Admin
const toggleProductAvailability = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { is_available } = req.body;

    await pool.query(
      `UPDATE products SET is_available = ? WHERE id = ?`,
      [!!is_available, productId]
    );
    res.status(200).json({ success: true, message: 'Product availability updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product recommendation
// @route   PATCH /api/admin/products/:id/recommend
// @access  Private/Admin
const toggleProductRecommendation = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { is_recommended } = req.body;

    await pool.query(
      `UPDATE products SET is_recommended = ? WHERE id = ?`,
      [!!is_recommended, productId]
    );
    res.status(200).json({ success: true, message: 'Product recommendation updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const softDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    await pool.query(
      `UPDATE products SET is_active = false WHERE id = ?`,
      [productId]
    );
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CATEGORIES
// ==========================================

const getAdminCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC, id DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name_he, name_ar, sort_order, is_active } = req.body;
    const activeVal = !(is_active === 'false' || is_active === false);
    const [result] = await pool.query(
      `INSERT INTO categories (name_he, name_ar, sort_order, is_active) VALUES (?, ?, ?, ?)`,
      [name_he, name_ar, sort_order || 0, activeVal]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name_he, name_ar, sort_order, is_active } = req.body;
    const activeVal = !(is_active === 'false' || is_active === false);
    await pool.query(
      `UPDATE categories SET name_he = ?, name_ar = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [name_he, name_ar, sort_order || 0, activeVal, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const softDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE categories SET is_active = false WHERE id = ?`, [id]);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// OPTION GROUPS
// ==========================================

const getAdminOptionGroups = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT og.*, p.name_he AS product_name_he 
       FROM option_groups og
       LEFT JOIN products p ON og.product_id = p.id
       ORDER BY p.id DESC, og.sort_order ASC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const createOptionGroup = async (req, res, next) => {
  try {
    const { product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active } = req.body;
    const [result] = await pool.query(
      `INSERT INTO option_groups 
       (product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, name_he, name_ar, selection_type || 'single',
        !!is_required, min_select || 0, max_select || 1,
        sort_order || 0, !(is_active === false || is_active === 'false')
      ]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateOptionGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order, is_active } = req.body;
    await pool.query(
      `UPDATE option_groups SET 
       product_id = ?, name_he = ?, name_ar = ?, selection_type = ?, is_required = ?, 
       min_select = ?, max_select = ?, sort_order = ?, is_active = ? 
       WHERE id = ?`,
      [
        product_id, name_he, name_ar, selection_type || 'single',
        !!is_required, min_select || 0, max_select || 1,
        sort_order || 0, !(is_active === false || is_active === 'false'), id
      ]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const softDeleteOptionGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE option_groups SET is_active = false WHERE id = ?`, [id]);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// OPTION ITEMS
// ==========================================

const getAdminOptionItems = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT oi.*, og.name_he AS group_name_he 
       FROM option_items oi
       LEFT JOIN option_groups og ON oi.group_id = og.id
       ORDER BY og.id DESC, oi.sort_order ASC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const createOptionItem = async (req, res, next) => {
  try {
    const { group_id, name_he, name_ar, price_change, sort_order, is_active } = req.body;
    const [result] = await pool.query(
      `INSERT INTO option_items (group_id, name_he, name_ar, price_change, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [group_id, name_he, name_ar, price_change || 0, sort_order || 0, !(is_active === false || is_active === 'false')]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateOptionItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { group_id, name_he, name_ar, price_change, sort_order, is_active } = req.body;
    await pool.query(
      `UPDATE option_items SET group_id = ?, name_he = ?, name_ar = ?, price_change = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [group_id, name_he, name_ar, price_change || 0, sort_order || 0, !(is_active === false || is_active === 'false'), id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const softDeleteOptionItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE option_items SET is_active = false WHERE id = ?`, [id]);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  getSettings,
  getStats,
  updateOverrideMode,
  updateMenuMode,
  updateBusinessInfo,

  getAdminProducts,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  toggleProductRecommendation,
  softDeleteProduct,
  getAdminCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  getAdminOptionGroups,
  createOptionGroup,
  updateOptionGroup,
  softDeleteOptionGroup,
  getAdminOptionItems,
  createOptionItem,
  updateOptionItem,
  softDeleteOptionItem
};
