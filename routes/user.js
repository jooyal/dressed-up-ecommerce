const express = require('express');
const router = express.Router();
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts, productDetails, getCart, placeOrder, getOrderHistory, getOrderItems, getOrderConfirmed, get404error, getAccessDenied } = require('../controller/user-controller')

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


module.exports = router;