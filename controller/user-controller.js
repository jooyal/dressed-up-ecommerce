const { fetchHomeProducts, fetchCategoryProducts, fetchProductDetails, fetchProDetailPageRecommend, fetchRecCategoryAndType, doSignUp, doLogin } = require('../model/user-helper.js')

const { userTokenGenerator } = require('../utilities/token')

module.exports = {
  landingPage : async (req, res, next)=> {
    try {
        let title = 'Explore Latest Styles For You and your Home - Dressed Up'

        let menProducts = await fetchHomeProducts('men')
        let womenProducts = await fetchHomeProducts('women')
        let livingProducts = await fetchHomeProducts('living')

        res.render('userView/landing-page', {title, menProducts, womenProducts, livingProducts, user:false, admin:false});
    } catch (error) {
        console.log(error);
    }
  },

    signupPage : (req,res)=> {
        let title = 'Create an account | Dressed Up'

        res.render('userView/signup', {title})
    },

    postSignUp : async (req,res)=> {
        let signupError
        let title = 'Create an account | Dressed Up'

        if(!req.body.fullName || !req.body.userEmail || !req.body.userMobile 
            || !req.body.userPassword || !req.body.confirmUserPassword){

            signupError = 'Please enter all the required details to continue'
            res.render('userView/signup', {title, signupError})
            signupError = null;

        } else if(req.body.userPassword !== req.body.confirmUserPassword){

            signupError = 'Passwords does not match!'
            res.render('userView/signup', {title, signupError})
            signupError = null;

        } else if((req.body.userMobile).length !== 10){

            signupError = 'Mobile number is not valid! Enter a valid number. Hint: Only enter the 10 digit number, no need for country code.'
            res.render('userView/signup', {title, signupError})
            signupError = null;

        } else if(req.body.termsCheckBox !== 'on'){

            signupError = 'Please agree to the privacy policy to continue'
            res.render('userView/signup', {title, signupError})
            signupError = null;

        } else if((req.body.userPassword).length < 8){

            signupError = 'Please enter a password that is atleast 8 characters long.'
            res.render('userView/signup', {title, signupError})
            signupError = null;

        } else{
            try {
                let response = await doSignUp(req.body)
                
                    if(response.status === false){

                        signupError = response.error
                        res.render('userView/signup', {title, signupError})
                        signupError = null;

                    }else {
                        const payload = {
                            userId: response.userId,
                            userName: req.body.fullName,
                            userEmail: req.body.userEmail,
                            userMobile: req.body.userMobile
                          }
                        
                        let accessToken = await userTokenGenerator(payload)

                        res.cookie("authToken", accessToken,{
                            httpOnly: true
                        }).redirect('/home')
                    }

            } catch (error) {
                console.log(error);
            }
        }

    },

    loginPage : (req,res)=> {

        let title = 'Log In to your Account | Dressed Up'
        res.render('userView/login',{title})
    },

    postLogin : async (req,res)=> {

        try {

            let loginError
            let title = 'Log In to your Account | Dressed Up'

            //console.log(req.body)
            if(!req.body.userEmail || !req.body.userPassword || (req.body.userPassword).length < 8) {
                res.status(401).render('userView/login',{title, loginError:'Enter your username or password to continue!'})
            
            }else {
                let response = await doLogin(req.body)

                if(response.status===false) {
                    loginError = response.error
                    res.status(401).render('userView/login',{title, loginError})

                }else if(response.status===true) {
                    //console.log(response.user);
                    const payload = {
                        userId: response.user._id,
                        userName: response.user.fullName,
                        userEmail: response.user.userEmail,
                        userMobile: response.user.userMobile
                      }
                    
                    let accessToken = await userTokenGenerator(payload)

                    //console.log(accessToken);

                    res.cookie("authToken", accessToken, {
                        httpOnly: true
                    }).redirect('/home')
                }
            }

        } catch (error) {
            console.log(error);
        }
        
    },

    otpLogin : (req,res)=> {

        let title = 'Log In to your Account | Dressed Up'
        res.render('userView/OTP-login',{title})
    },

    otpLoginVerification : (req,res)=> {

        let title = 'Enter the One Time Password sent to your account.'
        res.render('userView/OTP-login-verification',{title})
    },

    doSignOut : (req,res)=> {
//setting cookie value as null when signing out.
        res.cookie("authToken", null,{
            httpOnly: true
        }).redirect('/')

    },

    redirectToSignout : (req,res)=> {
        res.redirect('/signout')

    },

    userHome : async(req,res)=> {
        try {
            let title = 'Explore Latest Styles For You and your Home - Dressed Up'

            let menProducts = await fetchHomeProducts('men')
            let womenProducts = await fetchHomeProducts('women')
            let livingProducts = await fetchHomeProducts('living')

            res.render('userView/home', { title, user:true, menProducts, womenProducts, livingProducts });
        } catch (error) {
            console.log(error);
        }
        
    },

    getMenProducts : async (req,res)=> {
        try {
            let title = 'Explore All Products | Men'
            let allProducts = await fetchCategoryProducts('men')
            res.render('userView/view-products',{user:true, allProducts, title})
        } catch (error) {
            console.log(error);
        }
    },

    getWomenProducts : async (req,res)=>{
        try {
            let title = 'Explore All Products | Women'
            let allProducts = await fetchCategoryProducts('women')
            res.render('userView/view-products',{user:true, allProducts, title})
        } catch (error) {
            console.log(error);
        }
    },

    getLivingProducts : async (req,res)=>{
        try {
            let title = 'Explore All Products | Living & Home'
            let allProducts = await fetchCategoryProducts('living')
            res.render('userView/view-products',{user:true, allProducts, title})
        } catch (error) {
            console.log(error);
        }
    },

    // viewProducts : async (req,res)=> {

    //     let title = 'Explore All Products | Dressed-Up'
    //     let allProducts = await 
    //     res.render('userView/view-products',{user:true, title})
    // },

    productDetails : async (req,res)=> {
        try {
                //to get product details to be shown in product-details page
            let proDetails = await fetchProductDetails(req.params.id)
                //to see the category and type of the current product, searched using _id.
            let recItem = await fetchRecCategoryAndType(req.params.id)

            let recommendType //to assign new recommended type based on current product being shown

            if (recItem.category=='men'){
                if (recItem.type=='shirt'){
                    recommendType = 'jeans'
                }else if(recItem.type=='jeans'){
                    recommendType = 'shirt'
                }else if(recItem.type=='pants'){
                    recommendType = 'shirt'
                }else if(recItem.type=='wallet'){
                    recommendType = 'bag'
                }else if(recItem.type=='bag'){
                    recommendType = 'wallet'
                }
            }else if (recItem.category=='women'){
                if(recItem.type=='shirt'){
                    recommendType = 'pants'
                }else if(recItem.type=='pants'){
                    recommendType = 'jeans'
                }else if(recItem.type=='jeans'){
                    recommendType = 'shirt'
                }else if(recItem.type=='kurta'){
                    recommendType = 'jewellery'
                }else if(recItem.type=='jewellery'){
                    recommendType = 'bag'
                }else if(recItem.type=='bag'){
                    recommendType = 'kurta'
                }
            }else if (recItem.category=='living'){
                recommendType = 'bag'
                recItem.category = 'men'//as there is no bags listed in living category, we take the bags listed in men.
            }

            let title = 'View Product Details | '+ proDetails.productName + ' | Dressed Up'
                //to get items to be shown in recommend products below the page
            let bottomProducts = await fetchProDetailPageRecommend(recItem.category,recommendType)
            res.render('userView/product-details',{user:true, proDetails, bottomProducts, title})

        } catch (error) {
            console.log(error);
        }
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
        res.render('access-denied')
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