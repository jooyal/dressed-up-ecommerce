const { fetchHomeProducts } = require('../model/user-helper.js')


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
    userHome : async(req,res)=> {
        let menProducts = await fetchHomeProducts('men')
        let womenProducts = await fetchHomeProducts('women')
        let HomeProducts = await fetchHomeProducts('home')

        // console.log(menProducts);
        res.render('userView/home', { title: 'Explore Latest Styles For You and your Home - Dressed Up', user:true});
    },
    viewProducts : (req,res)=> {
        res.render('userView/view-products',{user:true})
    },
    productDetails : (req,res)=> {
        res.render('userView/product-details',{user:true})
    },
    getCart : (req,res)=>{
        res.render('userView/cart',{user:true})
    },
    placeOrder : (req,res)=> {
        res.render('userView/place-order',{user:true})
    },
    getOrderHistory : (req,res)=> {
        res.render('userView/order-history',{user:true})
    },
    getOrderItems : (req,res)=> {
        res.render('userView/order-history-items',{user:true})
    },
    getOrderConfirmed : (req,res)=> {
        res.render('userView/order-confirmed',{user:true})
    },
    get404error : (req,res)=> {
        res.render('404-error',{user:true})
    },
    getAccessDenied : (req,res)=> {
        res.render('access-denied',{user:true})
    },
    getContactUs : (req,res)=> {
        res.render('userView/contactus',{user:true})
    },
    getWishlist :(req,res)=> {
        res.render('userView/wishlist',{user:true})
    },
    getUserHelp :(req,res)=> {
        res.render('userView/user-help',{user:true})
    },
    getAboutUs :(req,res)=> {
        res.render('userView/about-us',{user:true})
    },
    getDeliveryInformation :(req,res)=> {
        res.render('userView/delivery-information',{user:true})
    },
    getPrivacyPolicy :(req,res)=> {
        res.render('userView/privacy-policy',{user:true})
    },
    getUserProfile :(req,res)=> {
        res.render('userView/user-profile',{user:true})
    },
    getChangeUserInfo :(req,res)=> {
        res.render('userView/change-user-info',{user:true})
    }
}