const express = require('express');
const router = express.Router();
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts, productDetails, getCart, placeOrder, getOrderHistory, getOrderItems, getOrderConfirmed, get404error, getAccessDenied, getContactUs, getWishlist, getDeliveryInformation, getAboutUs, getPrivacyPolicy, getUserHelp } = require('../controller/user-controller')

/* GET home page. */
router.get('/',landingPage);
router.get('/home',userHome)
router.get('/signup', signupPage)
router.get('/login',loginPage)
router.get('/OTP-login',otpLogin)
router.get('/OTP-login-verification',otpLoginVerification)
router.get('/view-products',viewProducts)
router.get('/product-details',productDetails)
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
router.get('/men')
router.get('/women')
router.get('/kids')
router.get('/accessories')
router.get('/living')
router.get('/user-profile')


module.exports = router;