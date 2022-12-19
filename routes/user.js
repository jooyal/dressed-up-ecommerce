const express = require('express');
const router = express.Router();
const {landingPage, signupPage, loginPage, otpLogin, otpLoginVerification, userHome } = require('../controller/user-controller')

/* GET home page. */
router.get('/',landingPage);
router.get('/home',userHome)
router.get('/signup', signupPage)
router.get('/login',loginPage)
router.get('/OTP-login',otpLogin)
router.get('/OTP-login-verification',otpLoginVerification)


module.exports = router;