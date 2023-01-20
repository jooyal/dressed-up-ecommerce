const { fetchAllOrders, doChangeOrderStatus, fetchAllUsers, fetchUserDetails, doBanUser, doUnBanUser } = require('../model/admin-helper.js')
const { fetchOrderDetails, fetchOrderItems } = require('../model/user-helper.js')

module.exports = {
  getAdminHome : (req,res)=> {
    res.render('adminView/admin-home',{admin:true})
  },

  getAllOrders : async(req,res)=>{
    try {
      let orders = await fetchAllOrders()
      let title = 'View All Orders | Admin | Dressed Up'
      // console.log(orders);
      res.render('adminView/order-list',{orders, title, admin:true})
    } catch (error) {
      console.log(error);
    }
  },

  getOrderDetails : async (req,res)=>{
    try {

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

      res.render('adminView/view-order-details', {title, products, orderDetails, admin:true})

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

      res.render('adminView/user-list', {title, users, admin:true})

    } catch (error) {
      console.log(error);
    }
  },

  getUserDetails : async(req,res)=>{
    try {
      let userId = req.params.id;
      let userDetails = await fetchUserDetails(userId)
      let title
      if(userDetails){
        title = 'Details for '+ userDetails.fullName + ' | Admin | Dressed Up'
        res.render('adminView/user-details', {userDetails, title, admin:true})
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
  }


}