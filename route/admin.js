const express = require('express');
const path = require('path');

const parentDir = (path.resolve(__dirname, '..'));

const { adminAuthorization } = require(parentDir + '/Authorization/tokenAuthentication.js');
const router = express.Router();
const { getSalesReport, postChangeTotalRevenueGST, postChangeTotalSaleNumber, getAdminHome, getChangeOrderStatus, getAllOrders, getOrderDetails, getAllUsers, getUserDetails, getBanUser, getUnBanUser, getAllCoupons, getDeleteDiscountOffer, getCreateOffer, getAddNewDiscountOffer, getEditDiscountOffer, postEditDiscountOffer, postUnlistSelectedProduct, postRelistSelectedProduct, getChangeCarousalImages, getChangeCarouselImages, getAllCarouselImages, getChangeCarouselMen, getChangeCarouselWomen, getChangeCarouselLiving, postChangeCarouselMen, postChangeCarouselWomen, postChangeCarouselLiving, getAdminLogin, postAdminLogin, getAdminLogout } = require(parentDir + '/controller/admin-controller.js')
const { getAddProduct, postAddProduct, getAllProducts, getEditProductDetails, postEditProductDetails, postDeleteSelectedProduct } = require(parentDir + '/controller/product-controller.js')


router.get('/login',getAdminLogin)
router.post('/login',postAdminLogin)

router.get('/logout',adminAuthorization, getAdminLogout)
router.get('/',adminAuthorization, getAdminHome)
router.get('/add-product', adminAuthorization, getAddProduct)
router.post('/add-product', adminAuthorization, postAddProduct)
router.get('/all-products', adminAuthorization, getAllProducts)
router.get('/all-orders', adminAuthorization, getAllOrders)
router.get('/view-order-details/:id', adminAuthorization, getOrderDetails)
router.post('/change-order-status', adminAuthorization, getChangeOrderStatus)
router.get('/all-users', adminAuthorization, getAllUsers)
router.get('/view-user-details/:id', adminAuthorization, getUserDetails)
router.post('/ban-selected-user', adminAuthorization, getBanUser)
router.post('/unban-selected-user', adminAuthorization, getUnBanUser)
router.get('/view-coupons', adminAuthorization, getAllCoupons)
router.post('/delete-discount-offer', adminAuthorization, getDeleteDiscountOffer)
router.get('/create-offer', adminAuthorization, getCreateOffer)
router.post('/add-new-discount-offer', adminAuthorization, getAddNewDiscountOffer)
router.get('/edit-offer/:id', adminAuthorization, getEditDiscountOffer)
router.post('/edit-discount-offer', adminAuthorization, postEditDiscountOffer)
router.post('/unlist-selected-product', adminAuthorization, postUnlistSelectedProduct)
router.post('/relist-selected-product', adminAuthorization, postRelistSelectedProduct)
router.get('/edit-product-details/:id', adminAuthorization, getEditProductDetails)
router.post('/edit-product-details', adminAuthorization, postEditProductDetails)
router.post('/delete-selected-product', adminAuthorization, postDeleteSelectedProduct)
router.get('/all-carousel', adminAuthorization, getAllCarouselImages),
router.get('/change-carousel-men', adminAuthorization, getChangeCarouselMen)
router.get('/change-carousel-women', adminAuthorization, getChangeCarouselWomen)
router.get('/change-carousel-living', adminAuthorization, getChangeCarouselLiving)
router.post('/change-carousel-men', adminAuthorization, postChangeCarouselMen)
router.post('/change-carousel-women', adminAuthorization, postChangeCarouselWomen)
router.post('/change-carousel-living', adminAuthorization, postChangeCarouselLiving)
router.post('/change-total-sale-number', adminAuthorization, postChangeTotalSaleNumber)
router.post('/change-total-revenue-tax-amount', adminAuthorization, postChangeTotalRevenueGST)
router.get('/sales-report', adminAuthorization, getSalesReport)

module.exports = router;