const pool = require('../config/db');

// @desc    Check API Health and DB Connection
// @route   GET /api/health
// @access  Public
const checkHealth = async (req, res, next) => {
  try {
    // Quick query to check db connection status
    await pool.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'API is running and database is connected.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API is running but database connection failed.',
      error: error.message
    });
  }
};

module.exports = { checkHealth };
