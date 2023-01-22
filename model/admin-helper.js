const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION, ORDER_COLLECTION, USER_COLLECTION, OFFER_COLLLECTION, ADMIN_COLLECTION } = require('./dbConnection/collection.js')
const {ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = {
  addProduct : (product)=>{
    return new Promise(async (resolve, reject) => {
      product.top = (product.top==='true')
      product.bottom = (product.bottom==='true')
      product.nosize = (product.nosize==='true')
      product.date = new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
      //console.log(product)
      let inserted = await db.get().collection(PRODUCT_COLLECTION).insertOne(product)
      //console.log(inserted)
      if(inserted) {
        resolve(inserted.insertedId)
      }else {
        reject('Product was not added to Database, Error occured!')
      }
    })
  },
  addProductImage : (id,img1,img2,img3,img4)=>{
    return new Promise(async(resolve, reject) => {
      try {
          let inserted = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},
        {$push:{image1:img1, image2:img2, image3:img3, image4:img4}})

        if(inserted){
          resolve(true)
        }
      } catch (error) {
        reject (error)
      }
    })
  },

  editProductImage1 : (id, imageValue)=>{
    return new Promise(async(resolve, reject) => {
      try {
          let inserted = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},
        {$set:{image1 : imageValue}})

        if(inserted){
          resolve(true)
        }
      } catch (error) {
        reject (error)
      }
    })
  },

  editProductImage2 : (id, imageValue)=>{
    return new Promise(async(resolve, reject) => {
      try {
          let inserted = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},
        {$set:{image2 : imageValue}})

        if(inserted){
          resolve(true)
        }
      } catch (error) {
        reject (error)
      }
    })
  },

  editProductImage3 : (id, imageValue)=>{
    return new Promise(async(resolve, reject) => {
      try {
          let inserted = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},
        {$set:{image3 : imageValue}})

        if(inserted){
          resolve(true)
        }
      } catch (error) {
        reject (error)
      }
    })
  },

  editProductImage4 : (id, imageValue)=>{
    return new Promise(async(resolve, reject) => {
      try {
          let inserted = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(id)},
        {$set:{image4 : imageValue}})

        if(inserted){
          resolve(true)
        }
      } catch (error) {
        reject (error)
      }
    })
  },

  fetchAllProducts : ()=>{
    return new Promise((resolve, reject) => {
      try {
        let products = db.get().collection(PRODUCT_COLLECTION).find().toArray()
        resolve(products)
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchAllOrders : ()=>{
    return new Promise((resolve, reject) => {
      try {
        let orders = db.get().collection(ORDER_COLLECTION).find().toArray()
        resolve(orders)
      } catch (error) {
        reject(error)
      }
    })
  },

  doChangeOrderStatus : (orderId, newStatus)=>{
    return new Promise(async (resolve, reject) => {
      try {
        let confirmation = await db.get().collection(ORDER_COLLECTION).updateOne({_id: ObjectId(orderId)},
        {$set : {orderStatus: newStatus}})

        if(confirmation.modifiedCount == 1){
          resolve({status:true, newStatus: newStatus, message:'modified successfully'})

        }else {
          resolve({status:false, error:'could not be modified'})

        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchAllUsers : ()=>{
    return new Promise(async(resolve, reject) => {
      try {
        let allUsers = await db.get().collection(USER_COLLECTION).find().toArray()
        if(allUsers){
          resolve(allUsers);
        }else {
          reject({status:false, error: 'No users exist!'})
        }

      } catch (error) {
        reject(error);
      }
    })
  },

  fetchUserDetails : (userId)=>{
    return new Promise((resolve, reject) => {
      try {
        let userDetails = db.get().collection(USER_COLLECTION).findOne({_id:ObjectId(userId)})
  
        if(userDetails){
          resolve(userDetails)
        }else {
          reject({status:false, error:'No matching user found.'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doBanUser : (userId)=>{
    return new Promise(async(resolve, reject)=>{
      try {
        let confirmation = await db.get().collection(USER_COLLECTION).updateOne({_id:ObjectId(userId)},
        {$set: {isBlocked: true}})

        if(confirmation.modifiedCount == 1){
          resolve({status:true, message: 'user blocked successfully'})
        } else {
          resolve({status:false, message: 'user already blocked'})
        }

      } catch(error){
        reject(error)
      }
    })
  },

  doUnBanUser : (userId)=>{
    return new Promise(async(resolve, reject)=>{
      try {
        let confirmation = await db.get().collection(USER_COLLECTION).updateOne({_id:ObjectId(userId)},
        {$set: {isBlocked: false}})

        if(confirmation.modifiedCount == 1){
          resolve({status:true, message: 'user unblocked successfully'})
        } else {
          resolve({status:false, message: 'user already unblocked'})
        }

      } catch(error){
        reject(error)
      }
    })
  },

  fetchAllCoupons : ()=>{
    return new Promise(async(resolve, reject) => {
      try {
        let offers = await db.get().collection(OFFER_COLLLECTION).find().toArray()

        if(offers){
          resolve(offers)
        }else {
          resolve({status: false, message: 'No offers exist!'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doDeleteDiscountOffer : (offerId)=>{
    return new Promise( async(resolve, reject) => {
      try {
        let confirmation = await db.get().collection(OFFER_COLLLECTION).deleteOne({_id:ObjectId(offerId)})
        if(confirmation){
          resolve({status:true, message:'Offer Removed Successfully'})
        }else {
          resolve({status:false, error:'Error, Could not remove the offer'})
        }


      } catch (error) {
        reject(error)
      }
    })
  },

  fetchAddNewDiscountOffer : (data)=>{
    return new Promise( async(resolve, reject) => {
      try {
        let offerObject = {
          code: data.code,
          percentage: parseInt(data.discount),
          expiresIn: parseInt(data.expiresIn),
          addedTime: new Date().getTime()
        }

        let alreadyExistCheck = await db.get().collection(OFFER_COLLLECTION).findOne({code: data.code})

        if(!alreadyExistCheck){
          let response = await db.get().collection(OFFER_COLLLECTION).insertOne(offerObject)
          // console.log(response);
          if(response.acknowledged){
            resolve({status:true, message:'Offer Code Inserted Successfully!'})
          }else {
            resolve({status:false, message:'Sorry! Could not add the coupon. Please try again.'})
          }
          
        }else {
          resolve({status:false, error:'Offer Code Already Exist In Database'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchOfferData : (offerId)=>{
    return new Promise((resolve, reject) => {
      try {
        let data = db.get().collection(OFFER_COLLLECTION).findOne({_id: ObjectId(offerId)})
        if(data){
          resolve(data)

        }else {
          resolve({status:false, error:'No Coupon found with the specified ID.'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doEditDiscountOffer : (offerId, discount, expiresIn)=>{
    return new Promise( async(resolve, reject) => {
      try {
        let editStatus

          if(expiresIn){
            editStatus = await db.get().collection(OFFER_COLLLECTION).updateOne({_id: ObjectId(offerId)},
                          {$set:{percentage: parseInt(discount), expiresIn: parseInt(expiresIn)}})

          }else {
            editStatus = await db.get().collection(OFFER_COLLLECTION).updateOne({_id: ObjectId(offerId)},
                          {$set:{percentage: parseInt(discount)}})
          }

      if(editStatus.modifiedCount === 1){
        resolve({status:true, message: 'Offer updated Successfully!'})
      } else {
        resolve({status:false, error: 'Failed to update offer.'})
      }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doUnlistSelectedProduct : (productId)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let confirmation = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(productId)},
                            {$set:{unlist:true}})
        
        if(confirmation.modifiedCount ===1){
          resolve({status:true, message:'Product Unlisted Successfully!'})
        }else {
          resolve({status:false, error:'Product Already Unlisted!'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doRelistSelectedProduct : (productId)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let confirmation = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id:ObjectId(productId)},
                            {$set:{unlist:false}})
        
        if(confirmation.modifiedCount ===1){
          resolve({status:true, message:'Product Relisted Successfully!'})
        }else {
          resolve({status:false, error:'Product Already listed!'})
        }                    

      } catch (error) {
        reject(error)
      }
    })
  },

  doEditProductDetails : (data)=>{
    return new Promise( async(resolve, reject) => {
      try {
        let response = await db.get().collection(PRODUCT_COLLECTION).updateOne({_id: ObjectId(data.productId)},
        {$set:{productName: data.productName, productCategory: data.productCategory,
           productPrice: data.productPrice, productDescription: data.productDescription
            }})

        if(response){
          resolve({status:true, message: 'Data updated successfully'})
        }else {
          reject()
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  doDeleteSelectedProduct : (productId)=>{
    return new Promise( async(resolve, reject) => {
      try {
        let response = await db.get().collection(PRODUCT_COLLECTION).deleteOne({_id: ObjectId(productId)})
        if(response){
          resolve({status:true, message: 'Product Removed Successfully!'})
        }else {
          resolve({status:false, error: 'Could Not Remove Product!'})
        }

      } catch (error) {
        reject(error)
      }
    })
  },

  doAdminLogIn : (data)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let confirmation = await db.get().collection(ADMIN_COLLECTION).findOne({email: data.adminEmail})

        if(confirmation){
          
          let passwordConfirm = await bcrypt.compare(data.adminPassword, confirmation.password)

          if(passwordConfirm){
            resolve({status: true, message:'Admin verified successfully', adminData: confirmation})
          }else {
            resolve({status:false, error:'Password incorrect!'})
          }

        }else {
          resolve({status: false, error:'Email does not exist!'})
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },




}