const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const businessController = require('../controllers/businessController');
const orderController = require('../controllers/orderController');

// Define public endpoints
router.get('/categories', categoryController.getCategories);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetails);
router.get('/business-status', businessController.getBusinessStatus);
router.post('/orders', orderController.createOrder); // Wait, if I'm not appending /public maybe it should be just /api prefix?
router.get('/orders/track/:orderNumber', orderController.trackOrder);

module.exports = router;
