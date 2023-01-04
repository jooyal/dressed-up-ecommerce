const express = require('express');
const router = express.Router();
const { userAuthorization } = require('../Authorization/tokenAuthentication')
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts, productDetails, getCart, placeOrder, getOrderHistory, getOrderItems, getOrderConfirmed, get404error, getAccessDenied, getContactUs, getWishlist, getDeliveryInformation, getAboutUs, getPrivacyPolicy, getUserHelp, getUserProfile, getChangeUserInfo, getMenProducts, getWomenProducts, getLivingProducts, postSignUp, postLogin, logOut, doLogOut, doSignOut, redirectToSignout, addProductToCart, getAddProductToCart, postAddProductToCart } = require('../controller/user-controller')

/* GET home page. */
router.get('/',landingPage);
router.get('/home', userAuthorization, userHome)
router.get('/signup', signupPage)
router.post('/signup',postSignUp)
router.get('/login',loginPage)
router.post('/login',postLogin)
router.get('/OTP-login',otpLogin)
router.get('/OTP-login-verification',otpLoginVerification)
// router.get('/view-products',viewProducts) all products cant be viewed, only category view is enabled.
router.get('/product-details/:id', userAuthorization, productDetails)
router.get('/cart', userAuthorization, getCart)
router.get('/add-to-cart/:id', userAuthorization, getAddProductToCart)
router.post('/add-to-cart/:id', userAuthorization, postAddProductToCart)
router.get('/place-order', userAuthorization, placeOrder)
router.get('/order-history', userAuthorization, getOrderHistory)
router.get('/view-order-items', userAuthorization, getOrderItems)
router.get('/order-confirmed', userAuthorization, getOrderConfirmed)
router.get('/404-error',get404error)
router.get('/access-denied',getAccessDenied)
router.get('/signout', userAuthorization, doSignOut)
router.get('/logout', redirectToSignout)
router.get('/wishlist', userAuthorization, getWishlist)
router.get('/contact-us',getContactUs)
router.get('/delivery-information',getDeliveryInformation)
router.get('/about-us',getAboutUs)
router.get('/privacy-policy',getPrivacyPolicy)
router.get('/contact-us',getContactUs)
router.get('/help',getUserHelp)
router.get('/men', userAuthorization, getMenProducts)
router.get('/women', userAuthorization, getWomenProducts)
router.get('/living', userAuthorization, getLivingProducts)
router.get('/user-profile', userAuthorization, getUserProfile)
router.get('/change-user-info', userAuthorization, getChangeUserInfo)


module.exports = router;