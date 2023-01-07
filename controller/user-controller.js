const { checkIfValidTokenExist } = require('../Authorization/tokenAuthentication.js')
const { fetchHomeProducts, fetchCategoryProducts, fetchProductDetails, fetchProDetailPageRecommend, fetchRecCategoryAndType, doSignUp, doLogin, addProductToCart, fetchCartProducts, checkProductType, fetchCartTotal, changeProductCount, fetchIndividualProSumTotal, removeCartProduct, fetchCartCount, addProductToWishlist, fetchWishlistProducts, moveFromWishlistToCart, removeFromWishlist, fetchWishlistCount } = require('../model/user-helper.js')

const { userTokenGenerator, tokenVerify } = require('../utilities/token')

module.exports = {
  landingPage : async (req, res, next)=> {
    try {
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

            res.render('userView/signup', {title})
        }
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

    otpLoginVerification : (req,res)=> {

        if(checkIfValidTokenExist(req)===true){
            res.redirect('/home')
        }else {
            let title = 'Enter the One Time Password sent to your account.'
            res.render('userView/OTP-login-verification',{title})
        }
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
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)

            let menProducts = await fetchHomeProducts('men')
            let womenProducts = await fetchHomeProducts('women')
            let livingProducts = await fetchHomeProducts('living')

            res.render('userView/home', { title, user:true, menProducts, womenProducts, livingProducts, cartCount, wishlistCount });
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
            let allProducts = await fetchCategoryProducts('men')
            res.render('userView/view-products',{user:true, allProducts, title, cartCount, wishlistCount})
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
            let allProducts = await fetchCategoryProducts('women')
            res.render('userView/view-products',{user:true, allProducts, title, cartCount, wishlistCount})
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
            let allProducts = await fetchCategoryProducts('living')
            res.render('userView/view-products',{user:true, allProducts, title, cartCount, wishlistCount})
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
            let decodedData = await tokenVerify(req.cookies.authToken)
            let cartCount = await fetchCartCount(decodedData.value.userId)
            let wishlistCount = await fetchWishlistCount(decodedData.value.userId)

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
            res.render('userView/product-details',{user:true, proDetails, bottomProducts, title, cartCount, wishlistCount})

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
                res.json({msg :'cart is empty'})
            }else {
                let total = await fetchCartTotal(decodedData.value.userId)
                let cartCount = await fetchCartCount(decodedData.value.userId)
                let wishlistCount = await fetchWishlistCount(decodedData.value.userId)

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
                res.render('userView/cart',{user:true, products, total, userId:decodedData.value.userId, title, cartCount, wishlistCount})
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

            let products = await fetchWishlistProducts(decodedData.value.userId)
            
        //check if wishlist exist or not. if not, render no wishlist page.
            if (products.wishlistExist === false) {

                res.send('wishlist does not exist for the user.');

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
                res.render('userView/wishlist',{user:true, cartCount, products, wishlistCount})

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


    
    placeOrder : (req,res)=> {
        res.render('userView/place-order',{user:true})
    },
    getOrderHistory : async(req,res)=> {
        let decodedData = await tokenVerify(req.cookies.authToken)
        let cartCount = await fetchCartCount(decodedData.value.userId)
        let wishlistCount = await fetchWishlistCount(decodedData.value.userId)
        res.render('userView/order-history',{user:true, cartCount, wishlistCount})
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