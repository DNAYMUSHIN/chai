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

router.get('/product/get', adminController.getAllProduct);

router.post('/product/status', adminController.getProductsByStatus);

// Route for deleting a product
router.delete('/product/delete', adminController.deleteProduct);

// Route for updating order status
router.put('/order/status', adminController.updateOrderStatus);

// Route for creating an order via the platform
router.post('/order/create', adminController.createOrder);

router.get('/orders/', adminController.getOrdersbyStatus)

router.get('/orders/all', adminController.getAllOrders)

router.put('/order/update', adminController.updateOrder);


// Route for generating sales reports
router.get('/report', adminController.generateDailyReport);

router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getAllCategories);
router.delete('/categories/:id', adminController.deleteCategory);

// Route for creating an order via barcode scanning
//router.post('/order/create-barcode', adminController.createOrderWithBarcode);






// Route for generating sales reports
router.post('/reportProduct', adminController.generateProductReport);



router.get('/number', (req, res) => {  // Добавлены req, res
    const randomNumber = Math.floor(Math.random() * 100);
    res.json({ number: randomNumber });            
});


module.exports = router;


