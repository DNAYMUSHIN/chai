const Router = require('express')
const router = new Router()
const customerController = require('../controller/customers.controller')

router.post('/register', customerController.createCustomer)
router.post('/login', customerController.enterCustomer)
router.get('/scan', customerController.scanCustomer)
router.put('/update', customerController.upDateCustomer)
router.post('/newOrder', customerController.createOrder)
router.delete('/cancelOrder', customerController.cancelOrder)
router.get('/checkStatus', customerController.checkStatus)

module.exports = router