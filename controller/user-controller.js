const { checkIfValidTokenExist } = require('../Authorization/tokenAuthentication.js')
const { fetchHomeProducts, fetchCategoryProducts, fetchProductDetails, fetchProDetailPageRecommend, fetchRecCategoryAndType, doSignUp, doLogin, addProductToCart, fetchCartProducts, checkProductType, fetchCartTotal, changeProductCount, fetchIndividualProSumTotal, removeCartProduct, fetchCartCount, addProductToWishlist, fetchWishlistProducts, moveFromWishlistToCart, removeFromWishlist, fetchWishlistCount, modifyUserData, changeUserPassword, checkIfPasswordTrue, fetchOrderTotal, checkIfCouponValid, fetchUserSavedAddress, getCartProductList, placeNewOrder, getRazorPay, verifyRazorpayPayment, changePaymentStatus, fetchUserOrderHistory, fetchOrderDetails, fetchOrderItems, userPhoneExistCheck, doMobileOTPLogin, fetchSortedProducts } = require('../model/user-helper.js')
const {requestOTP, verifyOTP} = require('../utilities/otpRequest')
const { userTokenGenerator, tokenVerify } = require('../utilities/token')

//global variables
let signupError = null;
let changeUserInfoErr = null;
let changeUserPasswordErr = null;
let allProductsGlobal = null;
let globalCategory = null;
let selectedTypeGlobal = null;
let maxPriceGlobal = null;

module.exports = {
  landingPage : async (req, res, next)=> {
    try {
        // if no valid token exist (false), render landing page. Else, redirect to home
        if(checkIfValidTokenExist(req)===false){
            let title = 'Explore Latest Styles For You and your Home - Dressed Up'
 
            let menProducts = await fetchHomeProducts('men')
            let womenProducts = await fetchHomeProducts('women')
            let livingProducts = await fetchHomeProducts('living')
    
            res.render('userView/landing-page', {title, menProducts, womenProducts, livingProducts, user:false, admin:false});
        
        }else {
            res.redirect('/home')
        }
        
    } catch (error) {
        console.log(error);
    }
  },

    signupPage : (req,res)=> {

        if(checkIfValidTokenExist(req)===true){
            res.redirect('/home')
        }else {
            let title = 'Create an account | Dressed Up'

            res.render('userView/signup', {title, signupError})
            signupError = null
        }
    },

    postSignUp : async (req,res)=> {
        let title = 'Create an account | Dressed Up'

        if(!req.body.fullName || !req.body.userEmail || !req.body.userMobile 
            || !req.body.userPassword || !req.body.confirmUserPassword){

            signupError = 'Please enter all the required details to continue'
            res.status(422).redirect('/signup')

        } else if(req.body.userPassword !== req.body.confirmUserPassword){

            signupError = 'Passwords does not match!'
            res.status(422).redirect('/signup')

        } else if((req.body.userMobile).length !== 10){

            signupError = 'Mobile number is not valid! Enter a valid number. Hint: Only enter the 10 digit number, no need for country code.'
            res.status(422).redirect('/signup')

        } else if(req.body.termsCheckBox !== 'on'){

            signupError = 'Please agree to the privacy policy to continue'
            res.status(422).redirect('/signup')

        } else if((req.body.userPassword).length < 8){

            signupError = 'Please enter a password that is atleast 8 characters long.'
            res.status(422).redirect('/signup')

        } else{
            try {
                let response = await doSignUp(req.body)
                
                    if(response.status === false){

                        signupError = response.error
                        res.status(422).redirect('/signup')

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

        if(checkIfValidTokenExist(req)){
            res.redirect('/home')
        }else {
            let title = 'Log In to your Account | Dressed Up'
            res.render('userView/login',{title})
        }
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

        if(checkIfValidTokenExist(req)===true){
            res.redirect('/home')
        }else {
            let title = 'Log In to your Account | Dressed Up'
            res.render('userView/OTP-login',{title})
        }
    },

    postOTPLogin : async(req,res)=>{
        try {

            if(checkIfValidTokenExist(req)===true){
                res.redirect('/home')
            }else {
    
                let mobileNumber = ('+91'+req.body.mobile);
                let response = await userPhoneExistCheck(mobileNumber)
    
                if(response === true){
                
                    requestOTP(mobileNumber)
    
                    res.json({status:true, mobile: mobileNumber})
                } else {
                    let error = 'User with mobile number '+ mobileNumber+" doesn't exist!"
                    res.json({status:false, error})
                }
            }
            
        } catch (error) {
            console.log(error);
        }
    },

    otpLoginVerification : (req,res)=> {

        if(checkIfValidTokenExist(req)===true){
            res.redirect('/home')
        }else {
            let mobileNo = req.params.id

            let title = 'Enter the One Time Password sent to your account.'
            res.render('userView/OTP-login-verification',{title, mobileNo})
        }
    },

    postOTPLoginVerification : async(req,res)=>{
        try {
            
            let mobile = '+91'+req.body.mobile
            let otpUnchecked = req.body.otp
            let match = otpUnchecked.match(/(\d+)/);

            let mobileExist = await userPhoneExistCheck(mobile)

            let otp = (match[0]);

            // console.log(mobile + '  '+ otpUnchecked + '  '+ otp)

            if(otp.length<6){
                console.log('otp error');
                res.json({status:false, error:'OTP is invalid.'})

            } else if(mobileExist === false){

                res.json({status:false, error:"User with mobile number "+ mobile+" doesn't exist!"})

            } else {
                let response = await verifyOTP(otp, mobile)

                if(response.status === true){
                    // Function to do login using mobile number.
                    let response = await doMobileOTPLogin(mobile)
                    if(response.status === true){

                        const payload = {
                            userId: response.user._id,
                            userName: response.user.fullName,
                            userEmail: response.user.userEmail,
                            userMobile: response.user.userMobile
                        }  
                        let accessToken = await userTokenGenerator(payload)
    
                        res.cookie("authToken", accessToken, {
                            httpOnly: true
                        })
                        .json({status:true, message:'OTP validated successfully', redirect: true})

                    } else {
                        res.json({status:false, error:'Mobile number not found in the database.'})
                    }
                    
                } else {
                    res.json({status:false, error:'OTP is incorrect, try again'})
                }
            }
            
        } catch (error) {
            console.log(error);
        }
    },

    doSignOut : (req,res)=> {
        //cookie is deleted when signing out.
        res.clearCookie('authToken').json({status:true});
    },

    redirectToSignout : (req,res)=> {
        res.redirect('/signout')

    },

    userHome : async(req,res)=> {
        try {
            let title = 'Explore Latest Styles For You and your Home - Dressed Up'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let menProducts = await fetchHomeProducts('men')
            let womenProducts = await fetchHomeProducts('women')
            let livingProducts = await fetchHomeProducts('living')

            res.render('userView/home', { title, userFullName, user:true, menProducts, womenProducts, livingProducts, cartCount, wishlistCount });
        } catch (error) {
            console.log(error);
        }
        
    },

    getMenProducts : async (req,res)=> {
        try {
            let title = 'Explore All Products | Men'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let allProducts = await fetchCategoryProducts('men')
            res.render('userView/view-products',{user:true, category:'men', userFullName, allProducts, title, cartCount, wishlistCount})
        } catch (error) {
            console.log(error);
        }
    },

    getWomenProducts : async (req,res)=>{
        try {
            let title = 'Explore All Products | Women'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let allProducts = await fetchCategoryProducts('women')
            res.render('userView/view-products',{user:true, category:'women', userFullName, allProducts, title, cartCount, wishlistCount})
        } catch (error) {
            console.log(error);
        }
    },

    getLivingProducts : async (req,res)=>{
        try {
            let title = 'Explore All Products | Living & Home'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let allProducts = await fetchCategoryProducts('living')
            res.render('userView/view-products',{user:true, category:'living', userFullName, allProducts, title, cartCount, wishlistCount})
        } catch (error) {
            console.log(error);
        }
    },

    postViewAllProducts : async(req,res)=>{
        try {

            let category = req.body.category
            let maxPrice = parseInt(req.body.maxPrice)
            let typeOfProduct = req.body.type

            //  console.log(category+maxPrice+typeOfProduct);
            globalCategory = category

            let allProducts = await fetchSortedProducts(category, maxPrice, typeOfProduct)

            allProductsGlobal = allProducts
            maxPriceGlobal = maxPrice
            selectedTypeGlobal = typeOfProduct

            res.json({status:true})
        } catch (error) {
            console.log(error);
        }
    },

    // viewProducts : async (req,res)=> {

    //     let title = 'Explore All Products | Dressed-Up'
    //     let allProducts = await 
    //     res.render('userView/view-products',{user:true, title})
    // },

    getViewProducts : async(req,res)=>{
        try {
            let title = 'Explore All Products | Living & Home'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let allProducts = allProductsGlobal
            res.render('userView/view-products',{user:true, maximumPrice: maxPriceGlobal, selectedType: selectedTypeGlobal, category:globalCategory, userFullName, allProducts, title, cartCount, wishlistCount})
            allProductsGlobal = null;
            globalCategory = null;
            selectedTypeGlobal = null;
            maxPriceGlobal = null;
        } catch (error) {
            console.log(error);
        }
    },

    productDetails : async (req,res)=> {
        try {
                //to get product details to be shown in product-details page
            let proDetails = await fetchProductDetails(req.params.id)
                //to see the category and type of the current product, searched using _id.
            let recItem = await fetchRecCategoryAndType(req.params.id)
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

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
            res.render('userView/product-details',{user:true, userFullName, proDetails, bottomProducts, title, cartCount, wishlistCount})

        } catch (error) {
            console.log(error);
        }
    },

    getAddProductToCart : async(req,res)=> {
        try {
            
            let productId = req.params.id
            let decodedData = await tokenVerify(req.cookies.authToken)
            let productSizeType = await checkProductType(productId)
            let productSize

            if(productSizeType === 'top'){
                productSize = 'productSizeSmall'

            } else if(productSizeType === 'bottom'){
                productSize = 'productSize32'

            } else if(productSizeType === 'freesize'){
                productSize = 'productFreeSize'

            }

            let response = await addProductToCart(decodedData.value.userId, productId, productSize)

            if(response){
                res.status(200).json({message:'added to cart'})
            }
        } catch (error) {
            console.log(error);
        }
    },

    postAddProductToCart : async (req,res)=> {
        try {
            
            //  console.log(req.body, req.params.id);
            let decodedData = await tokenVerify(req.cookies.authToken)
            let productSize = req.body.size;
            let productId = req.params.id;
            let productQuantity = parseInt(req.body.quantity)

            let response = await addProductToCart(decodedData.value.userId, productId, productSize, productQuantity)

            if(response){
                // res.send("<script>alert('Product Added To Cart')</script>").redirect('/product-details/'+productId)
                // res.location('/product-details/'+productId );
                res.json({status:true});
            }

        } catch (error) {
            console.log(error);
        }
    },

    getCart : async (req,res)=> {
        try {
            let title = 'Cart | DressedUp'
            let decodedData = await tokenVerify(req.cookies.authToken)
            let products = await fetchCartProducts(decodedData.value.userId)
            // console.log(products); 
            if(products.cartExist===false){
                let title = 'Cart Empty!'
                let total = await fetchCartTotal(decodedData.value.userId)
                let cartCount = await fetchCartCount(decodedData.value.userId)
                let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
                let userFullName = (decodedData.value.userName).toUpperCase()

                res.render('userView/cart-empty',{user:true, title, cartCount, wishlistCount, userFullName, total})


            }else {
                let total = await fetchCartTotal(decodedData.value.userId)
                let cartCount = await fetchCartCount(decodedData.value.userId)
                let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
                let userFullName = (decodedData.value.userName).toUpperCase()

                for (let i = 0; i < products.length; i++) {
                    if (products[i].size === 'productSizeSmall') {
                        products[i].size = 'Small'
                    }else if (products[i].size === 'productSizeMedium') {
                        products[i].size = 'Medium'
                    }else if (products[i].size === 'productSizeLarge') {
                        products[i].size = 'Large'
                    }else if (products[i].size === 'productSizeXLarge') {
                        products[i].size = 'X Large'
                    }else if (products[i].size === 'productSizeXXLarge') {
                        products[i].size = 'XX Large'
                    }else if (products[i].size === 'productSize32') {
                        products[i].size = '32'
                    }else if (products[i].size === 'productSize34') {
                        products[i].size = '34'
                    }else if (products[i].size === 'productSize36') {
                        products[i].size = '36'
                    }else if (products[i].size === 'productSize38') {
                        products[i].size = '38'
                    }else if (products[i].size === 'productSize40') {
                        products[i].size = '40'
                    }else if (products[i].size === 'productFreeSize') {
                        products[i].size = 'Free-Size'
                    }
                }
        // console.log(products);
                res.render('userView/cart',{user:true, products, userFullName, total, userId:decodedData.value.userId, title, cartCount, wishlistCount})
            }

        } catch (error) {
            
            console.log(error);

        }
    },

    postChangeProQuantity : async(req,res)=>{
        try {

            let response = await changeProductCount(req.body)
            let decodedData = await tokenVerify(req.cookies.authToken)

            if(response) {

                response.total = await fetchCartTotal(decodedData.value.userId)
                // response.productSumTotal = await fetchIndividualProSumTotal(decodedData.value.userId,req.body.time)

                res.json(response)
            }

        } catch (error) {
            console.log(error);
        }
    },

    postRemoveProduct : async(req,res)=>{
        // console.log(req.body);
        try {
            
            let response = await removeCartProduct(req.body)

            if(response){
                res.json(response)
            }

        } catch (error) {
            console.log(error);
        }
    },

    getAddProducToWishlist : async(req,res)=>{
        try {
            
            let productId = req.params.id
            let decodedData = await tokenVerify(req.cookies.authToken)
            let productSizeType = await checkProductType(productId)
            let productSize

            if(productSizeType === 'top'){
                productSize = 'productSizeSmall'

            } else if(productSizeType === 'bottom'){
                productSize = 'productSize32'

            } else if(productSizeType === 'freesize'){
                productSize = 'productFreeSize'

            }

            let response = await addProductToWishlist(decodedData.value.userId, productId, productSize)
            if(response){
                res.status(200).json({message:response.msg, status:response.status})
            }

        } catch (error) {
            console.log(error);
        }
    },
    
    postAddProducToWishlist : async(req,res)=>{
        try {

            let productId = req.params.id
            let decodedData = await tokenVerify(req.cookies.authToken)
            let productSize = req.body.size

            let response = await addProductToWishlist(decodedData.value.userId, productId, productSize)
            if(response){
                res.status(200).json({message:'added to wishlist'})
            }
            
        } catch (error) {
            console.log(error);
        }
    },

    getWishlist : async(req, res)=>{
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let products = await fetchWishlistProducts(decodedData.value.userId)
            
        //check if wishlist exist or not. if not, render no wishlist page.
            if (products.wishlistExist === false) {

                let title = 'Cart Empty!'
                let total = await fetchCartTotal(decodedData.value.userId)
                let cartCount = await fetchCartCount(decodedData.value.userId)
                let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
                let userFullName = (decodedData.value.userName).toUpperCase()

                res.render('userView/wishlist-empty',{user:true, title, cartCount, wishlistCount, userFullName, total})

            } else {

                for (let i = 0; i < products.length; i++) {
                    if (products[i].size === 'productSizeSmall') {
                        products[i].size = 'Small'
                    }else if (products[i].size === 'productSizeMedium') {
                        products[i].size = 'Medium'
                    }else if (products[i].size === 'productSizeLarge') {
                        products[i].size = 'Large'
                    }else if (products[i].size === 'productSizeXLarge') {
                        products[i].size = 'X Large'
                    }else if (products[i].size === 'productSizeXXLarge') {
                        products[i].size = 'XX Large'
                    }else if (products[i].size === 'productSize32') {
                        products[i].size = '32'
                    }else if (products[i].size === 'productSize34') {
                        products[i].size = '34'
                    }else if (products[i].size === 'productSize36') {
                        products[i].size = '36'
                    }else if (products[i].size === 'productSize38') {
                        products[i].size = '38'
                    }else if (products[i].size === 'productSize40') {
                        products[i].size = '40'
                    }else if (products[i].size === 'productFreeSize') {
                        products[i].size = 'Free-Size'
                    }
                }
                // console.log(products);
                res.render('userView/wishlist',{user:true, userFullName, cartCount, products, wishlistCount})

            }           
            
        } catch (error) {
            console.log(error);
        }
    },
    
    postMoveProductFromWishlist : async(req, res)=>{
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)

            //replacing size value to match with the value in database.
                if (req.body.size === 'Small') {
                    req.body.size = 'productSizeSmall'
                }else if (req.body.size === 'Medium') {
                    req.body.size = 'productSizeMedium'
                }else if (req.body.size === 'Large') {
                    req.body.size = 'productSizeLarge'
                }else if (req.body.size === 'X Large') {
                    req.body.size = 'productSizeXLarge'
                }else if (req.body.size === 'XX Large') {
                    req.body.size = 'productSizeXXLarge'
                }else if (req.body.size === '32') {
                    req.body.size = 'productSize32'
                }else if (req.body.size === '34') {
                    req.body.size = 'productSize34'
                }else if (req.body.size === '36') {
                    req.body.size = 'productSize36'
                }else if (req.body.size === '38') {
                    req.body.size = 'productSize38'
                }else if (req.body.size === '40') {
                    req.body.size = 'productSize40'
                }else if (req.body.size === 'Free-Size') {
                    req.body.size = 'productFreeSize'
                }

                let wishlistId = req.body.wishlistId;
                let productAddedTime = req.body.time
                let productId = req.body.item;
                let size = req.body.size;
                let userId = decodedData.value.userId;
                let quantity = 1;
                let cartResponse = await addProductToCart(userId, productId, size, quantity)
                
                if(cartResponse){
                    let wishlistResponse = await removeFromWishlist(wishlistId, productAddedTime)

                    if(wishlistResponse){
                        res.status(200).json({status : true})
                    }
                }

        } catch (error) {
            console.log(error);
        }
    },

    postRemoveProductFromWishlist : async(req, res)=>{
        try {

            let wishlistId = req.body.wishlistId;
            let productAddedTime = req.body.time

            let response = await removeFromWishlist(wishlistId, productAddedTime)

            if(response){
                res.status(200).json({status: true})
            }
            
        } catch (error) {
            console.log(error);
        }
    },


    
    getPlaceOrder : async(req,res)=> {
        let couponDiscount = null

        try {

        const url = require('url');
         console.log('URL : '+url.parse(req.headers.referer).pathname);
        
            if(url.parse(req.headers.referer).pathname === undefined || url.parse(req.headers.referer).pathname !== '/cart'){

                res.render('access-denied', {user:true, userFullName, cartCount, wishlistCount})
                    
            } else {

                let decodedData = await tokenVerify(req.cookies.authToken)
                let cartCount = await fetchCartCount(decodedData.value.userId)
                let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
                let userFullName = (decodedData.value.userName).toUpperCase()

                let orderTotal = await fetchOrderTotal(decodedData.value.userId, couponDiscount)
                let savedAddressData = await fetchUserSavedAddress(decodedData.value.userId)
                let savedAddressStatus
        
                if(savedAddressData.status){
                    savedAddressStatus = true
                }else {
                    savedAddressStatus = false
                }
        
                // if useraddress status is false, on rendering, it will show 'no saved address found.'
                // else, it will show the value.
                let userSavedAddress = {
                    status : savedAddressStatus,
                    value: (decodedData.value.userName).toUpperCase() + ' , '+ savedAddressData.address + ' , Ph:'+ decodedData.value.userMobile
                }
        
                res.render('userView/place-order',{user:true, userFullName, cartCount, wishlistCount, orderTotal, 
                    userId: decodedData.value.userId, 
                    userEmail: decodedData.value.userEmail, 
                    userMobile: decodedData.value.userMobile, 
                    userFullName: decodedData.value.userName, 
                    userSavedAddress})

            }
        
        } catch (error) {
            console.log(error);

            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            res.render('access-denied', {user:true, userFullName, cartCount, wishlistCount})
        }
    },

    postPlaceOrder : async (req,res)=>{

        let orderDetails = {}
        let paymentMethod = req.body.paymentMethod
        let decodedData = await tokenVerify(req.cookies.authToken)
        let couponCode = req.body.coupon
        let couponDiscount
        let orderTotal
        let products

        try {
            if(couponCode === null){
                couponDiscount = 0
            } else {
                let checkCouponValidity = await checkIfCouponValid(couponCode)

                if(checkCouponValidity.status){
                    couponDiscount = checkCouponValidity.discount;
                } else {
                    couponCode = '';
                    couponDiscount = 0;
                }
            }
            
            orderTotal = await fetchOrderTotal(decodedData.value.userId, couponDiscount)

            products = await getCartProductList(decodedData.value.userId)

            // console.log('status = '+req.body.deliveryAddress);
            if(req.body.deliveryAddress === '' || req.body.deliveryAddress === ', '){
                let  savedAddressData = await fetchUserSavedAddress(decodedData.value.userId)
                orderDetails.userId = decodedData.value.userId
                orderDetails.name = (decodedData.value.userName).toUpperCase()
                orderDetails.mobile = decodedData.value.userMobile
                orderDetails.address = savedAddressData.address
                orderDetails.paymentMethod = paymentMethod
                orderDetails.orderDiscountCode = couponCode
                orderDetails.orderDiscountPercent = couponDiscount + ' %'

            } else {
                orderDetails.userId = decodedData.value.userId
                orderDetails.name = req.body.orderName;
                orderDetails.mobile = req.body.orderMobile;
                orderDetails.address = req.body.deliveryAddress;
                orderDetails.paymentMethod = paymentMethod
                orderDetails.orderDiscountCode = couponCode
                orderDetails.orderDiscountPercent = couponDiscount + ' %'
            }

            if(paymentMethod === null){
                res.json({status:false, error:'Select a payment method to continue.'})
            } else {
                // console.log('success');
                // console.log(orderDetails);
                // console.log(orderTotal.grandTotal);
                // console.log(products);

                let response = await placeNewOrder(orderDetails, orderTotal, products)

                if(response.paymentMethod==='COD'){
                    res.json({orderId : response.orderId, codPayment: true, status:true})

                } else if (response.paymentMethod==='ONLINE'){
                    let razorpayOrderObj = await getRazorPay(response.orderId, orderTotal.grandTotal)

                    if(razorpayOrderObj){
                        res.json({rzpObj : razorpayOrderObj, orderId : response.orderId})
                    }

                } else {
                    console.log('Some error occured while checking for payment method!');
                }
            }

        } catch (error) {
            console.log(error);
        }
    },


    postVerifyPayment : async (req,res)=>{
        try {

            //  console.log(req.body);
            let body = req.body
            let rzpOrderObjId = body['order[id]']
            let DBOrderId = body['order[receipt]']
            let paymentId = body['payment[razorpay_payment_id]'];
            let paymentSignature = body['payment[razorpay_signature]'];

            // console.log(paymentId + '  /  ' + rzpOrderObjId + '  /  ' + paymentSignature);
            let response = await verifyRazorpayPayment(rzpOrderObjId, paymentId, paymentSignature)

            if(response){
                console.log('Payment Successful!');
                let statusChange = await changePaymentStatus(DBOrderId)
                if(statusChange.status){
                    console.log('Payment status changed succcessfully');
                    res.json({message:'Payment verified successfully.', status: true})
                } else {
                    console.log(statusChange.message);
                    res.json({message:'Payment verified successfully, but could not change payment status.', status: false})
                }
               
            } else {
                res.json({message:'Verification of payment failed.', status: false})
            }
            
        } catch (error) {
            console.log(error);
        }
    },
    
    getOrderHistory : async(req,res)=> {
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            let userOrderHistory = await fetchUserOrderHistory(decodedData.value.userId)

            console.log(userOrderHistory[0]);

            if(userOrderHistory[0] !== undefined){
                res.render('userView/order-history',{user:true, userFullName, cartCount, wishlistCount, userOrderHistory})
            } else {
                res.render('userView/order-history-empty',{user:true, userFullName, cartCount, wishlistCount})
            }

            // res.render('userView/order-history',{user:true, userFullName, cartCount, wishlistCount})
            
        } catch (error) {
            console.log(error);
        }
    },
    getOrderItems : async(req,res)=> {
        try {
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()
            let orderId = req.params.orderId;

            let orderDetails = await fetchOrderDetails(orderId)
            let products = await fetchOrderItems(orderId)

            if(orderDetails.discountCode == ''){
                orderDetails.discountCode = '-';
            }

            for (let i = 0; i < products.length; i++) {
                if (products[i].size === 'productSizeSmall') {
                    products[i].size = 'Small'
                }else if (products[i].size === 'productSizeMedium') {
                    products[i].size = 'Medium'
                }else if (products[i].size === 'productSizeLarge') {
                    products[i].size = 'Large'
                }else if (products[i].size === 'productSizeXLarge') {
                    products[i].size = 'X Large'
                }else if (products[i].size === 'productSizeXXLarge') {
                    products[i].size = 'XX Large'
                }else if (products[i].size === 'productSize32') {
                    products[i].size = '32'
                }else if (products[i].size === 'productSize34') {
                    products[i].size = '34'
                }else if (products[i].size === 'productSize36') {
                    products[i].size = '36'
                }else if (products[i].size === 'productSize38') {
                    products[i].size = '38'
                }else if (products[i].size === 'productSize40') {
                    products[i].size = '40'
                }else if (products[i].size === 'productFreeSize') {
                    products[i].size = 'Free-Size'
                }
            }

            res.render('userView/order-history-items',{user:true, cartCount, wishlistCount, userFullName, orderDetails, products})
            
        } catch (error) {
            console.log(error);
        }
    },
    getOrderConfirmed : async(req,res)=> {
        try {

        let orderId = req.params.id
        let decodedData = await tokenVerify(req.cookies.authToken)
        let cartCount = await fetchCartCount(decodedData.value.userId)
        let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
        let userFullName = (decodedData.value.userName).toUpperCase()

        res.render('userView/order-confirmed',{user:true, orderId, userFullName, cartCount, wishlistCount})
            
        } catch (error) {
            console.log(error);
        }
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
    getUserHelp :(req,res)=> {
        res.render('userView/user-help',{user:true})
    },
    getAboutUs :(req,res)=> {
        res.render('userView/about-us',{user:true})
    },
    getDeliveryInformation :(req,res)=> {
        res.render('userView/delivery-information',{user:false})
    },
    getPrivacyPolicy :(req,res)=> {
        res.render('userView/privacy-policy',{user:true})
    },
    getUserProfile :async(req,res)=> {
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            let userSavedAddress = await fetchUserSavedAddress(decodedData.value.userId)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            res.render('userView/user-profile',{user:true, userFullName, cartCount, wishlistCount, userSavedAddress:userSavedAddress.address, data:decodedData.value})
            
        } catch (error) {
            console.log(error);
        }
    },
    getChangeUserInfo :async(req,res)=> {
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            let userSavedAddress = await fetchUserSavedAddress(decodedData.value.userId)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            res.render('userView/change-user-info',{user:true, userFullName, cartCount, wishlistCount, data: decodedData.value, userSavedAddress:userSavedAddress.address, changeUserInfoErr})
            changeUserInfoErr = null

        } catch (error) {
            console.log(error);
        }
    },
    postChangeUserInfo : async(req,res)=>{
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            // console.log(req.body);
            
            // if mobile number exist in body, check if its length is 10.
            if(req.body.newUserMobile){
                if((req.body.newUserMobile).length !== 10){
                    changeUserInfoErr = 'Invalid mobile number.'
                    res.status(422).redirect('/change-user-info')
                }
            }
            //assigning values from body to an object.
            let newData = {}
            if(req.body.newUserName){
                newData.userName = req.body.newUserName
            }
            if(req.body.newUserEmail){
                newData.userEmail = req.body.newUserEmail
            }
            if(req.body.newUserMobile){
                newData.userMobile = req.body.newUserMobile
            }
            if(req.body.newUserAddress){
                newData.userAddress = req.body.newUserAddress
            }
            //check if the values inside the object is undefined, i.e, if the body contained no data.
            if(newData.userName === undefined && newData.userEmail === undefined && newData.userMobile === undefined && newData.userAddress === undefined){
                changeUserInfoErr = 'No data to be changed.'
                res.status(422).redirect('/change-user-info')

            } else {
                let response = await modifyUserData(decodedData.value.userId, newData)
                console.log(response);
                if(response.changeName || response.changeEmail || response.changeMobile || response.changeAddress){
                    res.json({status:true})
                }else {
                    res.json({status:false})
                }
            }

            
        } catch (error) {
            console.log(error);
        }
    },

    getChangeUserPassword : async(req,res)=>{
        try {

            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
            let userFullName = (decodedData.value.userName).toUpperCase()

            res.render('userView/change-user-password',{user:true, userFullName, cartCount, wishlistCount, data: decodedData.value, changeUserPasswordErr})
            changeUserPasswordErr = null
            
        } catch (error) {
            console.log(error);
        }
    },

    postChangeUserPassword : async(req,res)=>{
        try {

            let checkPasswordExist = await checkIfPasswordTrue(req.body.currentPassword, req.body.userId)
            if(checkPasswordExist.status === false){
                // changeUserPasswordErr = 'Current Password is not Valid!'
                // console.log('wrong password');
                res.json({status:false, msg:"Current Password is wrong!"})
        
            } else if (req.body.newPassword.length < 8){
                // changeUserPasswordErr = 'New Password should be of minimum 8 characters!'
                // console.log('wrong new password');
                res.json({status:false, msg:"New Password should be of minimum 8 characters!"})
        
            } else if (req.body.newPassword !== req.body.newPasswordConfirm){
                // changeUserPasswordErr = "New Password and New Password Confirm doesn't match!"
                // console.log('passwords dont match');
                res.json({status:false, msg:"New Password and New Password Confirm doesn't match!"})
        
            } else {
                let response = await changeUserPassword(req.body.userId, req.body.newPassword)
                
                if(response){
                    res.json({status:true})
                }else {
                    res.json({status:false, msg:'Some unexpected error occured! Please try again later.'})
                }
            }
            
        } catch (error) {
            console.log(error);
        }
    },

    postCheckIfCouponValid : async(req,res)=>{
        try {

            let userId = req.body.userId
            let discountCode = req.body.code

            let response = await checkIfCouponValid(discountCode)
            if(response.status===false){
                // res.json({status:false, error:response.message})
                let decodedData = await tokenVerify(req.cookies.authToken)
                let orderTotal = await fetchOrderTotal(decodedData.value.userId)
                console.log(orderTotal);
                res.json({
                    status:false, 
                    error:response.message, 
                    totalBeforeDisc : orderTotal.sumTotalBeforeDisc, 
                    discAmt : orderTotal.discountAmt, 
                    discPercentage : 0,
                    totalAfterDisc : orderTotal.sumTotalAfterDiscount, 
                    taxAmt : orderTotal.taxAmt, 
                    grandTotal : orderTotal.grandTotal
                })
            }else {
                let couponDiscount = response.discount;
                let decodedData = await tokenVerify(req.cookies.authToken)
                let orderTotal = await fetchOrderTotal(decodedData.value.userId, couponDiscount)
                console.log(orderTotal);
                res.json({
                    status:true, 
                    message:response.message, 
                    totalBeforeDisc : orderTotal.sumTotalBeforeDisc, 
                    discAmt : orderTotal.discountAmt, 
                    discPercentage : response.discount,
                    totalAfterDisc : orderTotal.sumTotalAfterDiscount, 
                    taxAmt : orderTotal.taxAmt, 
                    grandTotal : orderTotal.grandTotal
                })
            }
            
        } catch (error) {
            console.log(error);
        }
    }
}