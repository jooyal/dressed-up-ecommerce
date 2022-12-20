const express = require('express');
const router = express.Router();
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome, viewProducts } = require('../controller/user-controller')

/* GET home page. */
router.get('/',landingPage);
router.get('/home',userHome)
router.get('/signup', signupPage)
router.get('/login',loginPage)
router.get('/OTP-login',otpLogin)
router.get('/OTP-login-verification',otpLoginVerification)
router.get('/view-products',viewProducts)


module.exports = router;