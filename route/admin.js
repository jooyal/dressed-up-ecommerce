const express = require('express');
const router = express.Router();
const { getAdminHome, getChangeOrderStatus, getAllOrders, getOrderDetails, getAllUsers, getUserDetails, getBanUser, getUnBanUser, getAllCoupons, getDeleteDiscountOffer, getCreateOffer, getAddNewDiscountOffer, getEditDiscountOffer, postEditDiscountOffer} = require('../controller/admin-controller.js')
const { getAddProduct, postAddProduct, getAllProducts } = require('../controller/product-controller.js')


router.get('/',getAdminHome)
router.get('/add-product',getAddProduct)
router.post('/add-product',postAddProduct)
router.get('/all-products',getAllProducts)
router.get('/all-orders', getAllOrders)
router.get('/view-order-details/:id', getOrderDetails)
router.post('/change-order-status', getChangeOrderStatus)
router.get('/all-users', getAllUsers)
router.get('/view-user-details/:id', getUserDetails)
router.post('/ban-selected-user', getBanUser)
router.post('/unban-selected-user', getUnBanUser)
router.get('/view-coupons', getAllCoupons)
router.post('/delete-discount-offer', getDeleteDiscountOffer)
router.get('/create-offer', getCreateOffer)
router.post('/add-new-discount-offer', getAddNewDiscountOffer)
router.get('/edit-offer/:id', getEditDiscountOffer)
router.post('/edit-discount-offer', postEditDiscountOffer)

module.exports = router;