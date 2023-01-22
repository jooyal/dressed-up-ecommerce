const express = require('express');
const router = express.Router();
const { getAdminHome, getChangeOrderStatus, getAllOrders, getOrderDetails, getAllUsers, getUserDetails, getBanUser, getUnBanUser, getAllCoupons, getDeleteDiscountOffer, getCreateOffer, getAddNewDiscountOffer, getEditDiscountOffer, postEditDiscountOffer, postUnlistSelectedProduct, postRelistSelectedProduct, getChangeCarousalImages, getChangeCarouselImages, getAllCarouselImages, getChangeCarouselMen, getChangeCarouselWomen, getChangeCarouselLiving, postChangeCarouselMen, postChangeCarouselWomen, postChangeCarouselLiving } = require('../controller/admin-controller.js')
const { getAddProduct, postAddProduct, getAllProducts, getEditProductDetails, postEditProductDetails, postDeleteSelectedProduct } = require('../controller/product-controller.js')


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
router.post('/unlist-selected-product', postUnlistSelectedProduct)
router.post('/relist-selected-product', postRelistSelectedProduct)
router.get('/edit-product-details/:id', getEditProductDetails)
router.post('/edit-product-details', postEditProductDetails)
router.post('/delete-selected-product', postDeleteSelectedProduct)
router.get('/all-carousel', getAllCarouselImages),
router.get('/change-carousel-men', getChangeCarouselMen)
router.get('/change-carousel-women', getChangeCarouselWomen)
router.get('/change-carousel-living', getChangeCarouselLiving)
router.post('/change-carousel-men', postChangeCarouselMen)
router.post('/change-carousel-women', postChangeCarouselWomen)
router.post('/change-carousel-living', postChangeCarouselLiving)

module.exports = router;