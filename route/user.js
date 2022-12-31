const express = require('express');
const router = express.Router();
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts, productDetails, getCart, placeOrder, getOrderHistory, getOrderItems, getOrderConfirmed, get404error, getAccessDenied, getContactUs, getWishlist, getDeliveryInformation, getAboutUs, getPrivacyPolicy, getUserHelp, getUserProfile, getChangeUserInfo, getMenProducts, getWomenProducts, getLivingProducts } = require('../controller/user-controller')

/* GET home page. */
router.get('/',landingPage);
router.get('/home',userHome)
router.get('/signup', signupPage)
router.post('/signup',)
router.get('/login',loginPage)
router.get('/OTP-login',otpLogin)
router.get('/OTP-login-verification',otpLoginVerification)
// router.get('/view-products',viewProducts) all products cant be viewed, only category view is enabled.
router.get('/product-details/:id',productDetails)
router.get('/cart',getCart)
router.get('/place-order',placeOrder)
router.get('/order-history',getOrderHistory)
router.get('/view-order-items',getOrderItems)
router.get('/order-confirmed',getOrderConfirmed)
router.get('/404-error',get404error)
router.get('/access-denied',getAccessDenied)
router.get('/sign-out')
router.get('/wishlist',getWishlist)
router.get('/contact-us',getContactUs)
router.get('/delivery-information',getDeliveryInformation)
router.get('/about-us',getAboutUs)
router.get('/privacy-policy',getPrivacyPolicy)
router.get('/contact-us',getContactUs)
router.get('/help',getUserHelp)
router.get('/men', getMenProducts)
router.get('/women', getWomenProducts)
router.get('/living', getLivingProducts)
router.get('/user-profile',getUserProfile)
router.get('/change-user-info',getChangeUserInfo)


module.exports = router;