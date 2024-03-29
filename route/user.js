const express = require('express');
const router = express.Router();
const path = require('path');

const parentDir = (path.resolve(__dirname, '..'));

const { userAuthorization } = require(parentDir + '/Authorization/tokenAuthentication')
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts, productDetails, getCart, placeOrder, getOrderHistory, getOrderItems, getOrderConfirmed, get404error, getAccessDenied, getContactUs, getWishlist, getDeliveryInformation, getAboutUs, getPrivacyPolicy, getUserHelp, getUserProfile, getChangeUserInfo, getMenProducts, getWomenProducts, getLivingProducts, postSignUp, postLogin, logOut, doLogOut, doSignOut, redirectToSignout, addProductToCart, getAddProductToCart, postAddProductToCart, postChangeProQuantity, postRemoveProduct, getAddProducToWishlist, postAddProducToWishlist, postMoveProductFromWishlist, postRemoveProductFromWishlist, postChangeUserInfo, getChangeUserPassword, postChangeUserPassword, getPlaceOrder, postPlaceOrder, postCheckIfCouponValid, postVerifyPayment, postOTPLogin, postOTPLoginVerification, postViewProducts, postViewAllProducts, getViewProducts, getAvailableOffers } = require(parentDir + '/controller/user-controller')



/* pages without authorization. */
router.get('/',landingPage);
router.get('/signup', signupPage)
router.post('/signup',postSignUp)
router.get('/login',loginPage)
router.post('/login',postLogin)
router.get('/OTP-login',otpLogin)
router.post('/OTP-login',postOTPLogin)
router.get('/OTP-login-verification/:id',otpLoginVerification)
router.post('/OTP-login-verification',postOTPLoginVerification)
router.get('/contact-us',getContactUs)
router.get('/delivery-information',getDeliveryInformation)
router.get('/about-us',getAboutUs)
router.get('/privacy-policy',getPrivacyPolicy)
router.get('/contact-us',getContactUs)
router.get('/help',getUserHelp)
// router.get('/404-error',get404error)
// router.get('/access-denied',getAccessDenied)

/* pages with authorization */
router.get('/home', userAuthorization, userHome)
router.get('/view-products', userAuthorization, getViewProducts)
router.post('/view-products', userAuthorization, postViewAllProducts)
router.get('/product-details/:id', userAuthorization, productDetails)
router.get('/cart', userAuthorization, getCart)
router.get('/add-to-cart/:id', userAuthorization, getAddProductToCart)
router.post('/add-to-cart/:id', userAuthorization, postAddProductToCart)
router.get('/add-to-wishlist/:id', userAuthorization, getAddProducToWishlist)
router.post('/add-to-wishlist/:id', userAuthorization, postAddProducToWishlist)
router.post('/move-to-cart-from-wishlist', userAuthorization, postMoveProductFromWishlist)
router.post('/remove-from-wishlist', userAuthorization, postRemoveProductFromWishlist)
router.post('/change-product-quantity', userAuthorization, postChangeProQuantity)
router.post('/remove-cart-product', userAuthorization, postRemoveProduct)
router.get('/place-order', userAuthorization, getPlaceOrder)
router.post('/place-order', userAuthorization, postPlaceOrder)
router.post('/check-if-coupon-valid', userAuthorization, postCheckIfCouponValid)
router.get('/order-history', userAuthorization, getOrderHistory)
router.get('/view-order-items/:orderId', userAuthorization, getOrderItems)
router.post('/verify-payment', userAuthorization, postVerifyPayment)
router.get('/order-confirmed/:id', userAuthorization, getOrderConfirmed)
router.get('/signout', userAuthorization, doSignOut)
router.get('/logout', redirectToSignout)
router.get('/wishlist', userAuthorization, getWishlist)
router.get('/men', userAuthorization, getMenProducts)
router.get('/women', userAuthorization, getWomenProducts)
router.get('/living', userAuthorization, getLivingProducts)
router.get('/user-profile', userAuthorization, getUserProfile)
router.get('/change-user-info', userAuthorization, getChangeUserInfo)
router.post('/change-user-info', userAuthorization, postChangeUserInfo)
router.get('/change-user-password', userAuthorization, getChangeUserPassword)
router.post('/change-user-password', userAuthorization, postChangeUserPassword)
router.get('/available-offers', userAuthorization, getAvailableOffers)

module.exports = router;