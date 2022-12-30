const { fetchHomeProducts, fetchCategoryProducts, fetchProductDetails, fetchProDetailPageRecommend, fetchRecCategoryAndType } = require('../model/user-helper.js')


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
        try {
            let menProducts = await fetchHomeProducts('men')
            let womenProducts = await fetchHomeProducts('women')
            let livingProducts = await fetchHomeProducts('living')

            // console.log(menProducts);
            res.render('userView/home', { title: 'Explore Latest Styles For You and your Home - Dressed Up', user:true, menProducts, womenProducts, livingProducts });
        } catch (error) {
            console.log(error);
        }
        
    },
    getMenProducts : async (req,res)=> {
        try {
            let allProducts = await fetchCategoryProducts('men')
            res.render('userView/view-products',{user:true, allProducts})
        } catch (error) {
            console.log(error);
        }
    },
    getWomenProducts : async (req,res)=>{
        try {
            let allProducts = await fetchCategoryProducts('women')
            res.render('userView/view-products',{user:true, allProducts})
        } catch (error) {
            console.log(error);
        }
    },
    getLivingProducts : async (req,res)=>{
        try {
            let allProducts = await fetchCategoryProducts('living')
            res.render('userView/view-products',{user:true, allProducts})
        } catch (error) {
            console.log(error);
        }
    },
    viewProducts : (req,res)=> {
        res.render('userView/view-products',{user:true})
    },
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


            //to get items to be shown in recommend products below the page
            let bottomProducts = await fetchProDetailPageRecommend(recItem.category,recommendType)
            res.render('userView/product-details',{user:true, proDetails, bottomProducts })
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