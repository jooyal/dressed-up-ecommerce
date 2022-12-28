const express = require('express');
const router = express.Router();
const { getAdminHome} = require('../controller/admin-controller.js')
const { getAddProduct, postAddProduct, getAllProducts } = require('../controller/product-controller.js')

/* GET home page. */
router.get('/',getAdminHome)
router.get('/add-product',getAddProduct)
router.post('/add-product',postAddProduct)
router.get('/all-products',getAllProducts)
module.exports = router;