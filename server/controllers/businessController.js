const businessService = require('../services/businessService');

// @desc    Get current business status (open/closed)
// @route   GET /api/business-status
// @access  Public
const getBusinessStatus = async (req, res, next) => {
  try {
    const status = await businessService.getBusinessStatus();
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBusinessStatus };
