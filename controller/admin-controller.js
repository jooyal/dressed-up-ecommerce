const path = require('path');

const parentDir = (path.resolve(__dirname, '..'));

const { fetchAllOrders, doChangeOrderStatus, fetchAllUsers, fetchUserDetails, doBanUser, doUnBanUser, fetchAllCoupons, doDeleteDiscountOffer, fetchAddNewDiscountOffer, fetchOfferData, doEditDiscountOffer, doUnlistSelectedProduct, doRelistSelectedProduct, checkIfAdminEmailExist, doAdminLogIn } = require(parentDir + '/model/admin-helper.js')
const { fetchOrderDetails, fetchOrderItems, fetchProductDetails } = require(parentDir + '/model/user-helper.js')
const { userTokenGenerator, adminTokenGenerator, adminTokenVerify } = require(parentDir + '/utilities/token.js')

// global objects
let adminLoginError = null

module.exports = {
  
  getAdminHome : (req,res)=> {
    res.render('adminView/admin-home',{admin:true})
  },

  getAdminLogin : (req,res)=>{
    res.render('adminView/login', {title:'LogIn To Admin Dashboard | Dressed Up', adminLoginError})
    adminLoginError = null
  },

  postAdminLogin : async(req,res)=>{
    try {
      let data = req.body
      if(!data.adminEmail || !data.adminPassword){
        adminLoginError = 'Email & Password are mandatory'
        res.redirect('/admin/login')

      }else {
        let response = await doAdminLogIn(data)
        if(response.status === false){
          adminLoginError = response.error
          res.redirect('/admin/login')
        }else {
          const payload = {
            adminId: response.adminData._id,
            adminName: response.adminData.fullName,
            adminEmail: response.adminData.email,
            isAdmin: true
            // adminMobile: response.user.userMobile
          }
        
          let accessToken = await adminTokenGenerator(payload)

          console.log(accessToken);

          res.cookie("authToken", accessToken, {
              httpOnly: true
          }).redirect('/admin')
        }
        
      }

    } catch (error) {
      console.log(error);
    }
  },

  getAllOrders : async(req,res)=>{
    try {
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      let orders = await fetchAllOrders()
      let title = 'View All Orders | Admin | Dressed Up'
      // console.log(orders);
      res.render('adminView/order-list',{orders, title, admin:true, adminName})
    } catch (error) {
      console.log(error);
    }
  },

  getAdminLogout : (req,res)=>{
    try {
      res.clearCookie('authToken').json({status:true});

    } catch (error) {
      console.log(error);
    }
  },

  getOrderDetails : async (req,res)=>{
    try {
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      let orderId = req.params.id;
      let title = 'View Order Details | Admin | Dressed Up'
      let orderDetails = await fetchOrderDetails(orderId)
      let products = await fetchOrderItems(orderId);

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

      res.render('adminView/view-order-details', {title, products, orderDetails, adminName, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

  getChangeOrderStatus : async(req,res)=>{
    try {
      let status = req.body.status
      let newStatus
      if(status == 'shipped'){
        newStatus = 'shipped'
      } else if (status == 'cancelled'){
        newStatus = 'cancelled'
      }
      else {
        res.json({status:false, error: 'Status recieved in server is invalid'})
      }

      let orderId = req.body.orderId
      let response = await doChangeOrderStatus(orderId, newStatus)

      res.json(response)
      
    } catch (error) {
      console.log(error);
    }
  },

  getAllUsers : async(req,res)=>{
    try {
      let title = 'View All Users | Admin | Dressed Up'
      let users = await fetchAllUsers()
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName

      res.render('adminView/user-list', {title, adminName, users, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

  getUserDetails : async(req,res)=>{
    try {
      let userId = req.params.id;
      let userDetails = await fetchUserDetails(userId)
      let title
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      if(userDetails){
        title = 'Details for '+ userDetails.fullName + ' | Admin | Dressed Up'
        res.render('adminView/user-details', {userDetails, adminName, title, admin:true})
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  getBanUser : async(req,res)=>{
    try {
      let userId = req.body.userId
      let response = await doBanUser(userId)
      if(response){
        res.json(response)
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  getUnBanUser : async(req,res)=>{
    try {
      let userId = req.body.userId
      let response = await doUnBanUser(userId)
      if(response){
        res.json(response)
      }

    } catch (error) {
      console.log(error);
    }
  },

  getAllCoupons : async(req,res)=>{
    try {
      let title = 'View All Coupons | Admin | Dressed Up'
      let offers = await fetchAllCoupons()
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName

      if(offers.status!==false){
        res.render('adminView/offer-list', {title, adminName, offers, admin:true})
      }else {
        res.json(offers.message)
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  getDeleteDiscountOffer : async(req, res)=>{
    try {
      let offerId = req.body.offerId;
      let response = await doDeleteDiscountOffer(offerId)
      if(response){
        res.json({status:response.status, message:response.message})
      }else {
        res.json({status:false, error:"Offer Does Not Exist!"})
      }

    } catch (error) {
      console.log(error);
    }
  },

  getCreateOffer : async(req,res)=>{
    try {
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      let title = 'Create New Coupon Discount | Admin | Dressed Up'
      res.render('adminView/create-offer', {title, adminName, admin:true})
      
    } catch (error) {
      console.log(error);
    }
  },

  getAddNewDiscountOffer : async(req,res)=>{
    try {
      let expiresIn = req.body.expiresIn
      let currentTime = new Date().getTime()
      let code = req.body.code
      let discount = req.body.discount

      if(!code || !discount || !expiresIn){
          res.json({status:false, error:'Enter All Fields To Continue'})

      }else if (code.length<8){
          res.json({status:false, error:'8 characters required for the Coupon Code'})

      }else if(discount>80){
          res.json({status:false, error:'Maximum discount allowed is 80%'})

      }else if(expiresIn<currentTime+86400000){
          res.json({status:false, error:'Minimum duration of 24 hours required.'})

      }else {
        let response = await fetchAddNewDiscountOffer(req.body)
        if(response){
          res.json(response)
        }else {
          res.json({status:false, error:'Sorry! Could not add the coupon. Internal server error.'})
        }
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  getEditDiscountOffer : async(req,res)=>{
    try {
      let title = 'Edit Coupon Discount | Admin | Dressed Up';
      let offerId = req.params.id
      let offer = await fetchOfferData(offerId)

      if(offer.status!==false){
        let date = new Date(offer.expiresIn)
        offer.expiresIn = date
        let decodedData = await adminTokenVerify(req.cookies.authToken)
        let adminName = decodedData.value.adminName
        res.render('adminView/edit-offer', {title, offer, adminName, admin:true})
      }else {
        res.json(offer.error)
      }    
      
    } catch (error) {
      console.log(error);
    }
  },

  postEditDiscountOffer : async(req,res)=>{
    try {

      let discount = req.body.discount
      let offerId = req.body.offerId
      let offerCheck = fetchOfferData(offerId)

      if(offerCheck.status!==false){

        let addedTime = offerCheck.addedTime
        let expiresIn = req.body.expiresIn
        let response

        if(!discount){
            res.json({status:false, error: 'Enter Discount To Continue'})

        }else if(discount>80){
            res.json({status:false, error: 'Maximum discount allowed is 80%'})

        }else {
            if(expiresIn){
                if(expiresIn<addedTime+86400000){
                    res.json({status:false, error: 'A minimum of 24 hours validity required from coupon added time.'})

                }else {
                  response = await doEditDiscountOffer(offerId, discount, expiresIn)

                }
            }else {
              response = await doEditDiscountOffer(offerId, discount)

            }
        }
        
        if(response){
          res.json(response)
        }else {
          res.json({status:false, error:'Sorry! Could not edit the coupon. Internal server error.'})
        }

      }else {
        res.json(offerCheck.error)
      }
      
    } catch (error) {
      console.log(error);
    }
  },

  postUnlistSelectedProduct : async(req,res)=>{
    try {
      let response = await doUnlistSelectedProduct(req.body.productId)

      if(response){
        res.json(response)
      }else{
        res.json({status:false, error:'Sorry! Could not unlist the product. Internal server error.'})
      }

    } catch (error) {
      console.log(error);
    }
  },

  postRelistSelectedProduct : async(req,res)=>{
    try {
      let response = await doRelistSelectedProduct(req.body.productId)

      if(response){
        res.json(response)
      }else{
        res.json({status:false, error:'Sorry! Could not relist the product. Internal server error.'})
      }

    } catch (error) {
      console.log(error);
    }
  },


  getAllCarouselImages : async(req,res)=>{
    try {
      let title = 'All Carousel Images | Admin | Dressed Up'
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      res.render('adminView/all-carousel', {title, adminName, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

  getChangeCarouselMen : async(req,res)=>{
    try {
      let title = 'Change Men Carousel Images | Admin | Dressed Up'
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      res.render('adminView/change-carousel-men', {title, adminName, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

  getChangeCarouselWomen : async(req,res)=>{
    try {
      let title = 'Change Men Carousel Images | Admin | Dressed Up'
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      res.render('adminView/change-carousel-women', {title, adminName, admin:true})
      
    } catch (error) {
      console.log(error);
    }
  },

  getChangeCarouselLiving : async(req,res)=>{
    try {
      let title = 'Change Men Carousel Images | Admin | Dressed Up'
      let decodedData = await adminTokenVerify(req.cookies.authToken)
      let adminName = decodedData.value.adminName
      res.render('adminView/change-carousel-living', {title, adminName, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

postChangeCarouselMen : async(req,res)=>{
  try {
    if(req.files!== null){

      if(req.files.menCarouselImage1!== undefined){
        let image1 = req.files.menCarouselImage1
        // let imageName1 = req.body.productId + 1 + path.extname(image1.name);
        await image1.mv('./public/carouselImage/men-carousel-1.jpg')
      }
      if(req.files.menCarouselImage2!== undefined){
        let image2 = req.files.menCarouselImage2
        await image2.mv('./public/carouselImage/men-carousel-2.jpg')
      }
      if(req.files.menCarouselImage3!== undefined){
        let image3 = req.files.menCarouselImage3
        await image3.mv('./public/carouselImage/men-carousel-3.jpg')
      }

      res.redirect('/admin/all-carousel')

    }else {
      res.redirect('/admin/all-carousel')
    }
    
  } catch (error) {
    console.log(error);
  }
},

postChangeCarouselWomen : async(req,res)=>{
  try {
    if(req.files!== null){

      if(req.files.womenCarouselImage1!== undefined){
        let image1 = req.files.womenCarouselImage1
        // let imageName1 = req.body.productId + 1 + path.extname(image1.name);
        await image1.mv('./public/carouselImage/women-carousel-1.jpg')
      }
      if(req.files.womenCarouselImage2!== undefined){
        let image2 = req.files.womenCarouselImage2
        await image2.mv('./public/carouselImage/women-carousel-2.jpg')
      }
      if(req.files.womenCarouselImage3!== undefined){
        let image3 = req.files.womenCarouselImage3
        await image3.mv('./public/carouselImage/women-carousel-3.jpg')
      }

      res.redirect('/admin/all-carousel')

    }else {
      res.redirect('/admin/all-carousel')
    }
    
  } catch (error) {
    console.log(error);
  }
},

postChangeCarouselLiving : async(req,res)=>{
  try {
    if(req.files!== null){

      if(req.files.livingCarouselImage1!== undefined){
        let image1 = req.files.livingCarouselImage1
        // let imageName1 = req.body.productId + 1 + path.extname(image1.name);
        await image1.mv('./public/carouselImage/living-carousel-1.jpg')
      }
      if(req.files.livingCarouselImage2!== undefined){
        let image2 = req.files.livingCarouselImage2
        await image2.mv('./public/carouselImage/living-carousel-2.jpg')
      }
      if(req.files.livingCarouselImage3!== undefined){
        let image3 = req.files.livingCarouselImage3
        await image3.mv('./public/carouselImage/living-carousel-3.jpg')
      }

      res.redirect('/admin/all-carousel')

    }else {
      res.redirect('/admin/all-carousel')
    }
    
  } catch (error) {
    console.log(error);
  }
},





}