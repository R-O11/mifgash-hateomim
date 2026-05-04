const pool = require('../config/db');

// @desc    Get all active and available products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, category_id, name_he, name_ar, description_he, description_ar, 
              base_price, image_url, prep_time_minutes, is_recommended 
       FROM products 
       WHERE is_active = true AND is_available = true`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product details by ID (includes options)
// @route   GET /api/products/:id
// @access  Public
const getProductDetails = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const [productRows] = await pool.query(
      `SELECT id, category_id, name_he, name_ar, description_he, description_ar, 
              base_price, image_url, prep_time_minutes, is_available 
       FROM products 
       WHERE id = ? AND is_active = true`,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    const product = productRows[0];

    // Fetch Option Groups
    const [groupRows] = await pool.query(
      `SELECT id, name_he, name_ar, selection_type, is_required, min_select, max_select, sort_order 
       FROM option_groups 
       WHERE product_id = ? AND is_active = true 
       ORDER BY sort_order ASC`,
      [productId]
    );

    // If no groups, return just the product
    if (groupRows.length === 0) {
      product.option_groups = [];
      return res.status(200).json({ success: true, data: product });
    }

    const groupIds = groupRows.map((g) => g.id);

    // Fetch Option Items for all groups at once
    const [itemRows] = await pool.query(
      `SELECT id, group_id, name_he, name_ar, price_change, sort_order 
       FROM option_items 
       WHERE group_id IN (?) AND is_active = true 
       ORDER BY sort_order ASC`,
      [groupIds]
    );

    // Nest items under their respective groups
    const optionGroups = groupRows.map(group => {
      return {
        ...group,
        items: itemRows.filter(item => item.group_id === group.id)
      };
    });

    product.option_groups = optionGroups;

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductDetails };
