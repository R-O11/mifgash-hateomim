const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

router.get('/settings', adminController.getSettings);
router.get('/stats', adminController.getStats);
router.patch('/settings/manual-override', adminController.updateOverrideMode);
router.patch('/settings/menu-mode', adminController.updateMenuMode);
router.patch('/settings/info', adminController.updateBusinessInfo);


router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

router.get('/products', adminController.getAdminProducts);
router.post('/products', upload.single('image'), adminController.createProduct);
router.put('/products/:id', upload.single('image'), adminController.updateProduct);
router.patch('/products/:id/toggle', adminController.toggleProductAvailability);
router.patch('/products/:id/recommend', adminController.toggleProductRecommendation);
router.delete('/products/:id', adminController.softDeleteProduct);

router.get('/categories', adminController.getAdminCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.softDeleteCategory);

router.get('/option-groups', adminController.getAdminOptionGroups);
router.post('/option-groups', adminController.createOptionGroup);
router.put('/option-groups/:id', adminController.updateOptionGroup);
router.delete('/option-groups/:id', adminController.softDeleteOptionGroup);

router.get('/option-items', adminController.getAdminOptionItems);
router.post('/option-items', adminController.createOptionItem);
router.put('/option-items/:id', adminController.updateOptionItem);
router.delete('/option-items/:id', adminController.softDeleteOptionItem);

module.exports = router;
