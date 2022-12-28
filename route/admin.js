const express = require('express');
const router = express.Router();
const { getAdminHome, getAddProduct, postAddProduct } = require('../controller/admin-controller')

/* GET home page. */
router.get('/',getAdminHome)
router.get('/add-product',getAddProduct)
router.post('/add-product',postAddProduct)
module.exports = router;