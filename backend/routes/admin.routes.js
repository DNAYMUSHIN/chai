const Router = require('express');
const router = new Router();
const adminController = require('../controller/admin.controller');


router.post('/registerAd', adminController.createAdmin);

router.post('/loginAd', adminController.enterAdmin);
// Route for adding a product
router.post('/product/add', adminController.addProduct);

router.post('/product/p', adminController.searchProduct);

// Route for updating a product
router.put('/product/update', adminController.updateProduct);

// Route for deleting a product
router.delete('/product/delete', adminController.deleteProduct);

// Route for updating order status
router.put('/order/status', adminController.updateOrderStatus);

// Route for creating an order via the platform
router.post('/order/create', adminController.createOrder);

// Route for generating sales reports
router.get('/report', adminController.generateReport);

// Route for creating an order via barcode scanning
//router.post('/order/create-barcode', adminController.createOrderWithBarcode);


module.exports = router;


