const express = require('express');
const router = express.Router();
const { getAdminHome} = require('../controller/admin-controller.js')
const { getAddProduct, postAddProduct, getAllProducts, getAllOrders } = require('../controller/product-controller.js')


router.get('/',getAdminHome)
router.get('/add-product',getAddProduct)
router.post('/add-product',postAddProduct)
router.get('/all-products',getAllProducts)
router.get('/all-orders', getAllOrders)

module.exports = router;