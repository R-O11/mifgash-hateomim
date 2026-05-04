const orderService = require('../services/orderService');
const businessService = require('../services/businessService');

// @desc    Create a new order from a customer
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res, next) => {
  try {
    // 1. Verify business is unconditionally accepting orders
    const businessStatus = await businessService.getBusinessStatus();
    
    if (!businessStatus.isOpen) {
      return res.status(400).json({
        success: false, 
        message: 'The restaurant is currently not accepting new orders.',
        reason: businessStatus.mode
      });
    }

    // 2. Validate generic payload structure
    const { customer_name, customer_phone, order_type, items } = req.body;

    if (!customer_name || !customer_phone) {
       return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    if (!['delivery', 'pickup'].includes(order_type)) {
       return res.status(400).json({ success: false, message: 'Invalid order type. Must be delivery or pickup.' });
    }

    if (!items || items.length === 0) {
       return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // 3. Delegate complex price logic and saving to service
    const result = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: result
    });

  } catch (error) {
    // Map known validation errors to 400 Bad Request
    if (error.message && (
      error.message.includes('invalid') || 
      error.message.includes('unavailable') || 
      error.message.includes('mismatch') || 
      error.message.includes('must select') ||
      error.message.includes('too many')
    )) {
       return res.status(400).json({ success: false, message: error.message });
    }
    
    next(error);
  }
};

// @desc    Get order details by order number for tracking
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required' });
    }

    const orderData = await orderService.getOrderForTracking(orderNumber);

    if (!orderData) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, trackOrder };
