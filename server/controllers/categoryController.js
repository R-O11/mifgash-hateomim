const pool = require('../config/db');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name_he, name_ar, image_url, sort_order FROM categories WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories };
