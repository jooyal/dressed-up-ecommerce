


module.exports = {
    landingPage : (req, res, next)=> {
        res.render('userView/landing-page', { title: 'Explore Latest Styles For You and your Home - Dressed Up'});
    },
    signupPage : (req,res)=> {
        res.render('userView/signup', {title: 'Create an account | Dressed Up'})
    },
    loginPage : (req,res)=> {
        res.render('userView/login',{title:'Log In to your Account | Dressed Up'})
    },
    otpLogin : (req,res)=> {
        res.render('userView/OTP-login',{title:'Log In to your Account | Dressed Up'})
    },
    otpLoginVerification : (req,res)=> {
        res.render('userView/OTP-login-verification',{title:'Enter the One Time Password sent to your account.'})
    },
    userHome : (req,res)=> {
        res.render('userView/home', { title: 'Explore Latest Styles For You and your Home - Dressed Up', user:true});
    },
    viewProducts : (req,res)=> {
        res.render('userView/view-products',{user:true})
    }
}