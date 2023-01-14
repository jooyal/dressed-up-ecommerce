const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION, USER_COLLECTION, CART_COLLECTION, WISHLIST_COLLECTION, OFFER_COLLLECTION, ORDER_COLLECTION } = require('./dbConnection/collection.js')
const {ObjectId} = require('mongodb')
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

module.exports = {
  fetchHomeProducts : (category)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let homeProducts = await db.get().collection(PRODUCT_COLLECTION).find({productCategory:category}).limit(4).toArray()
        resolve(homeProducts)
      } catch (error) {
        reject(error)
      }
    })
  },
  // fetchAllCategoryProducts : ()=>{
  //   return new Promise((resolve, reject) => {
  //     try {
        
  //     } catch (error) {
        
  //     }
  //   })
  // },
  fetchCategoryProducts : (category)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let allProducts = await db.get().collection(PRODUCT_COLLECTION).find({productCategory : category}).toArray()
        resolve(allProducts)
      } catch (error) {
        reject (error)
      }
    })
  },
  fetchProductDetails : (id)=> {
    return new Promise(async (resolve, reject) => {
      try {
        let productDetails = await db.get().collection(PRODUCT_COLLECTION).findOne({_id : ObjectId(id)})
        //calculating discount percentage
        productDetails.productDiscount = Math.round(((productDetails.productMRP - productDetails.productPrice)/productDetails.productMRP)*100);
        resolve(productDetails)
        
      } catch (error) {
        reject(error)
      }
    })
  },
  fetchRecCategoryAndType : (id)=>{ //recommended categories and type
    return new Promise(async (resolve, reject) => {
      try {
        let categoryAndType = await db.get().collection(PRODUCT_COLLECTION).aggregate([
          {
            $match:{_id:ObjectId(id)}
          },
          {
            $project:{
              category: '$productCategory',
              type: '$productType'
            }
          }
        ]).toArray()

        //console.log(categoryAndType[0]);
        resolve(categoryAndType[0])
      } catch (error) {
        reject(error)
      }
    })
  },
  fetchProDetailPageRecommend : (category,type)=>{
    return new Promise(async (resolve, reject) => {
      try {
        let items = await db.get().collection(PRODUCT_COLLECTION).find({productCategory : category, productType : type}).limit(4).toArray()
        resolve(items)
      } catch (error) {
        reject(error)
      }
    })
  },

  checkIfUserBlocked : (userId)=>{
    return new Promise( async(resolve, reject) => {
      let status = await db.get().collection(USER_COLLECTION).findOne({_id:ObjectId(userId)})

      if(status.isBlocked){
        reject()
      }else {
        resolve()
      }
    })
  },

  fetchCartCount : (userId)=>{
    return new Promise(async(resolve, reject) => {
      try {
        let count = 0
        let cart = db.get().collection(CART_COLLECTION).findOne({user : ObjectId(userId)})
        if(cart) {
          count = await db.get().collection(CART_COLLECTION).aggregate([
            {
              $match : {user : ObjectId(userId)}
            },
            {
              $project : {
                '_id': 0,//no need for id in output.
                'totalQuantity' : {$sum:'$products.quantity'}
              }
            }

          ]).toArray()
        }

        if(count[0]){
          resolve(count[0].totalQuantity)
        }else {
          resolve(0)
        }

      } catch (error) {
        reject(error)
      }
    })
  },

  doSignUp : (data)=>{
    return new Promise(async (resolve, reject) => {
      try {

        let checkIfEmailExist = await db.get().collection(USER_COLLECTION).findOne({userEmail:data.userEmail})
        let checkIfMobileExist = await db.get().collection(USER_COLLECTION).findOne({userMobile:data.userMobile})
        //console.log(checkIfEmailExist);

        if(checkIfEmailExist !== null) {
          resolve({status:false, error: 'Account already exist with this email, do sign-in instead.'});
        }else if(checkIfMobileExist !== null) {
          resolve({status:false, error: 'Account already exist with this Mobile Number, do sign-in instead.'});
        }else {
          data.userMobile = '+91' + data.userMobile;
          data.isBlocked = false;
          data.userAddress = null;
          delete data.confirmUserPassword;
          delete data.termsCheckBox;
          //hashing password
          data.userPassword = await bcrypt.hash(data.userPassword,10);

          let response = await db.get().collection(USER_COLLECTION).insertOne(data);

          if(response) {
            //console.log(response.insertedId);
            resolve({status:true, userId:response.insertedId});
          }else {
            reject({error: "Couldn't insert data to Database"});
          }
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },
  doLogin : (loginData)=> {
    return new Promise(async (resolve, reject) => {

      try {

        let userData = await db.get().collection(USER_COLLECTION).findOne({userEmail : loginData.userEmail})

        if(!userData) {
          resolve({status:false, error:'User data does not exist in database. Please create an account to continue.'})
        } else {
          let status = await bcrypt.compare(loginData.userPassword,userData.userPassword)

          if(status) {
            console.log('User login success!');
            resolve({status: true, user: userData})

          }else {
            resolve({status:false, error:'Incorrect Password!'})
          }
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },
  
  addProductToCart : (userId, productId, productSize, productQuantity)=>{
    // console.log('accessed');
    let productObject = {
      item: ObjectId(productId),
      size: productSize,
      quantity: (productQuantity || 1),
      time: new Date().getTime()
    }
    // console.log(productObject);
    return new Promise(async(resolve, reject) => {
      try {
        let usercart = await db.get().collection(CART_COLLECTION).findOne({user: ObjectId(userId)})

          //if a cart exist which is linked to users id, execute this.
          if(usercart){
            //check if the currently added product previously existed in the cart of the user.
            let productExistCheck = usercart.products.findIndex((product) => product.item==productId && product.size==productSize);

            //if product does exist, increase the quantity of the product.
            if(productExistCheck!=-1){

                if(!productQuantity){

                    let response = await db.get().collection(CART_COLLECTION).updateOne({'products.item':ObjectId(productId),'user':ObjectId(userId)},
                                    {
                                        $inc:{'products.$.quantity':1}
                                    });

                    if(response){
                      console.log(response);
                      resolve(response)
                    }
                } else{

                  let response = await db.get().collection(CART_COLLECTION).updateOne({'products.item':ObjectId(productId),'user':ObjectId(userId), 'products.size':productSize},
                                    {
                                        $inc:{'products.$.quantity':productQuantity}
                                    });

                    if(response){
                      console.log(response);
                      resolve(response)
                    }
                }

              //if product doesn't exist in cart, but cart does exist for the user, make an object
              //with product-id and its initial quantity as '1' and push the object to the products array.
                
            }else {
              let response = await db.get().collection(CART_COLLECTION)
                              .updateOne({user:ObjectId(userId)},
                              {

                                  $push:{products:productObject}
                              
                              })

              if(response){
                console.log(response);
                resolve(response)
              }
            }

            //if a cart doesnot exist, make a cart with users id and add an array named products
            // and we will push the id of the product and its quantity togather as an object to the array.
          }else {
            let cartObj = {
                user: ObjectId(userId),
                products : [productObject]
            }
            let response = await db.get().collection(CART_COLLECTION).insertOne(cartObj)

            if(response){
              console.log(response);
              resolve(response)
            }
          }
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchCartProducts : (userId)=> {
    return new Promise(async(resolve, reject) => {
      try {
        
        let cartProducts = await db.get().collection(CART_COLLECTION).aggregate([
          {
            $match : {user: ObjectId(userId)}
          },
          {
            $unwind : '$products'
          },
          {
            $project : {
              item : '$products.item',
              quantity : '$products.quantity',
              size : '$products.size',
              time: '$products.time'
            }
          },
          {
            $lookup : {
              from : PRODUCT_COLLECTION,
              localField : 'item',
              foreignField : '_id',
              as : 'productInfo'
            }
          },
          {
            $project : {
              item : 1, quantity : 1, size : 1, time:1, product : {$arrayElemAt : ['$productInfo',0]}
            }
          },
          {
            $project : {
              item : 1, quantity : 1, size : 1, product : 1, time : 1,
              subTotal: {
                $multiply: ['$quantity', {$toInt :'$product.productPrice'}]
              }
            }
          }
        ]).toArray()

        let cartExistCheck = await db.get().collection(CART_COLLECTION).findOne({user : ObjectId(userId)})
          //console.log(cartExistCheck);

        if(cartExistCheck && cartExistCheck.products[0]!==undefined){
          resolve(cartProducts)
        }else if(!cartExistCheck) {
          resolve({cartExist:false})
        }else if(cartExistCheck.products === undefined) {
          resolve({cartExist:false})
        }else {
          resolve({cartExist:false})
        }

        
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchCartTotal : (userId)=>{
    return new Promise(async(resolve, reject) => {
      try {
        
        let total = await db.get().collection(CART_COLLECTION).aggregate([
          {
            $match : {user : ObjectId(userId)}
          },
          {
            $unwind : '$products'
          },
          {
            $project : {
              item : '$products.item',
              quantity : '$products.quantity'
            }
          },
          {
            $lookup : {
              from : PRODUCT_COLLECTION,
              localField : 'item',
              foreignField : '_id',
              as : 'productInfo'
            }
          },
          {
            $project : {
              quantity : 1, product : {$arrayElemAt:['$productInfo',0]}
            }
          },
          {
            $project : {
              quantity : 1, productPrice : {$toInt :'$product.productPrice'}
            }
          },
          {
            $group : {
              _id : null,
              sumTotal : {$sum : {$multiply : ['$quantity', '$productPrice']}}
            }
          },
          {
            $project : {
              sumTotal : 1,
              taxAmount : {$multiply : [{$divide : ['$sumTotal',100]}, 12]}, //12 is here because GST for clothes are 12%
            }
          },
          {
            $project : {
              _id : 0, sumTotal : 1, taxAmount : 1, grandTotal : {$sum : ["$sumTotal", "$taxAmount"]}
            }
          }
        ]).toArray()

        let totalAmtObject = total[0]

        if(totalAmtObject !== undefined){
          totalAmtObject.taxAmount = Math.round(totalAmtObject.taxAmount)
          totalAmtObject.grandTotal = Math.round(totalAmtObject.grandTotal)
  
          resolve(totalAmtObject);
          
        }else {
          let dummyOut = {}
          dummyOut.sumTotal = 0
          dummyOut.taxAmount = 0
          dummyOut.grandTotal = 0
          resolve(dummyOut)
        }

        

      } catch (error) {
        reject(error)
      }
    })
  },

  checkProductType : (productId)=>{
    return new Promise(async(resolve, reject) => {
      try {
        
        let product = await db.get().collection(PRODUCT_COLLECTION).findOne({_id: ObjectId(productId)})
        let productSizeType

        if(product.top===true){
          productSizeType = 'top'

        } else if(product.bottom ===true){
          productSizeType = 'bottom'

        } else if(product.top===false && product.bottom ===false) {
          productSizeType = 'freesize'

        }

        resolve(productSizeType)
        
      } catch (error) {
        reject(error)
      }
    })
  },

  changeProductCount : (details)=>{
    return new Promise(async (resolve, reject) => {
      try {

        if(details.count=='-1' && details.quantity=='1') {
          console.log();
          let response = await db.get().collection(CART_COLLECTION)
                            .updateOne({_id:ObjectId(details.cart)},
                            {
                              $pull : {
                                products : {time : parseInt(details.time)}
                              }
                            });
          if(response){
            //console.log(response);
            resolve({removeProduct:true})
          }

        }else {
          let response = await db.get().collection(CART_COLLECTION)
                            .updateOne({_id:ObjectId(details.cart),'products.time': parseInt(details.time)},
                            {
                              $inc : {
                                'products.$.quantity' : parseInt(details.count)
                              }
                            });
          if(response){
            //console.log(response);
            resolve({removeProduct:false})
          }
        }
        
      } catch (error) {
        reject(error)
      }
    })
  },

  // fetchIndividualProSumTotal : (userId, productAddedTime)=>{
  //   return new Promise(async(resolve, reject) => {
  //     try {
        
  //       let response = await db.get().collection(CART_COLLECTION).aggregate([
  //         {
  //           $match : {user: ObjectId(userId)}
  //         }, 
  //         {
  //           $unwind : '$products'
  //         },
  //         {
  //           $match: {'products.time': parseInt(productAddedTime)}
  //         },
  //         {
  //           $lookup : {
  //             from : PRODUCT_COLLECTION,
  //             localField : 'products.item',
  //             foreignField : '_id',
  //             as : 'productInfo'
  //           }
  //         },
  //         {
  //           $project : {
  //             quantity : '$products.quantity', product : {$arrayElemAt:['$productInfo',0]}
  //           }
  //         },
  //         {
  //           $project : {
  //             quantity : 1, price : '$product.productPrice'
  //           }
  //         },
  //         {
  //           $project : {
  //             productSumTotal : {$multiply:['$quantity',{$toInt: '$price'}]}
  //           }
  //         }
  //       ]).toArray()
        
  //       resolve(response[0].productSumTotal)

  //     } catch (error) {
  //       reject(error)
  //     }
  //   })
  // }

removeCartProduct : (details)=>{
    return new Promise( async(resolve, reject) => {
      try {
        
        let response = await db.get().collection(CART_COLLECTION)
                              .updateOne({_id:ObjectId(details.cart)},
                              {
                                $pull : {
                                  products : {time : parseInt(details.time)}
                                }
                              });
        
        if(response.modifiedCount === 1){
          resolve(true)
        }else {
          reject({msg: 'Error removing the product. modifiedCount !== 1'})
        }

      } catch (error) {
        reject(error)
      }
    })
},

addProductToWishlist : (userId, productId, productSize)=>{
  let productObject = {
    item: ObjectId(productId),
    size: productSize,
    quantity: 1,
    time: new Date().getTime()
  }

  return new Promise(async(resolve, reject) => {
    try {
      //check if userwishlist document already exist for the user.
      let userWishlist = await db.get().collection(WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
      
      //if wishlist document for the user exist, execute this.
      if(userWishlist){
        let productExistCheck = userWishlist.products.findIndex((product)=>product.item==productId && product.size==productSize)

        //if product already present with given size in wishlist, execute this.
        if(productExistCheck != -1) {
          resolve({msg: 'product already present in wishlist', status:false})
        }else {
          //if product doesnot exist in wishlist or product present but with different size, execute this.
          let response = await db.get().collection(WISHLIST_COLLECTION)
                                .updateOne({user : ObjectId(userId)},
                                {
                                  $push : {products: productObject}
                                })
          if(response){
            console.log(response);
            resolve({msg: 'product added to wishlist', status:true})
          }
        }
      }else {
        //if a wishlist document doeesnot exist for the user, create one.

        let wishObj = {
          user: ObjectId(userId),
          products : [productObject]
        }
        let response = await db.get().collection(WISHLIST_COLLECTION).insertOne(wishObj)

        if(response){
          console.log(response);
          resolve({msg: 'product added to wishlist', status:true})
        }
      }

    } catch (error) {
      reject(error)
    }
  })
},

fetchWishlistProducts : (userId)=>{
  return new Promise(async(resolve, reject) => {
    try {

      let wishlistProducts = await db.get().collection(WISHLIST_COLLECTION).aggregate([
        {
          $match : {
            user: ObjectId(userId)
          }
        },
        {
          $unwind : '$products'
        },
        {
          $project : {
            item : '$products.item',
            size : '$products.size',
            time : '$products.time',
            quantity : '$products.quantity'
          }
        },
        {
          $lookup : {
            from : PRODUCT_COLLECTION,
            localField : 'item',
            foreignField : '_id',
            as : 'productInfo'
          }
        },
        {
          $project : {
            item : 1, size : 1, time:1, quantity : 1, product : {$arrayElemAt : ['$productInfo',0]}
          }
        }
      ]).toArray()

      let wishlistExistCheck = await db.get().collection(WISHLIST_COLLECTION).findOne({user : ObjectId(userId)})

      if(wishlistExistCheck && wishlistExistCheck.products[0]!==undefined){
        resolve(wishlistProducts)
      }else if(!wishlistExistCheck) {
        resolve({wishlistExist:false})
      }else if(wishlistExistCheck.products === undefined) {
        resolve({wishlistExist:false})
      }else {
        resolve({wishlistExist:false})
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

removeFromWishlist : (wishlistId, productAddedTime)=>{
  return new Promise(async(resolve, reject) => {
    try {
      
      let response = await db.get().collection(WISHLIST_COLLECTION)
                      .updateOne({_id:ObjectId(wishlistId)},{
                        $pull : {
                          products : {time: parseInt(productAddedTime)}
                        }
                      });

      if(response.modifiedCount === 1){
        resolve(true)
      }else {
        reject({msg: 'Error removing the product. modifiedCount !== 1'})
      }

    } catch (error) {
      reject(error)
    }
  })
},

fetchWishlistCount : (userId)=>{
  return new Promise( async(resolve, reject) => {
    try {
      let count = 0
      let wishlist = await db.get().collection(WISHLIST_COLLECTION).findOne({user: ObjectId(userId)})
      if(wishlist){
        count = await db.get().collection(WISHLIST_COLLECTION).aggregate([
          {
            $match : {user : ObjectId(userId)}
          },
          {
            $project : {
              _id : 0,
              'totalQuantity' : {$size: '$products'}
            }
          }
        ]).toArray()
      }

      if(count[0]){
        resolve(count[0].totalQuantity)
      }else {
        resolve(0)
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

modifyUserData : (userId, newData)=>{
  return new Promise(async(resolve, reject) => {
    try {

      let response = {}

      if(newData.userName){
        console.log('new Name Exist');
        response.changeName = await db.get().collection(USER_COLLECTION).updateOne({_id : ObjectId(userId)}, {$set : {fullName : newData.userName}})
      }
      if(newData.userEmail){
        response.changeEmail = await db.get().collection(USER_COLLECTION).updateOne({_id : ObjectId(userId)}, {$set: {userEmail : newData.userEmail}})
      }
      if(newData.userMobile){
        response.changeMobile = await db.get().collection(USER_COLLECTION).updateOne({_id : ObjectId(userId)}, {$set: {userMobile : newData.userMobile}})
      }
      if(newData.userAddress){
        response.changeAddress = await db.get().collection(USER_COLLECTION).updateOne({_id : ObjectId(userId)}, {$set: {userAddress : newData.userAddress}})
      }

      resolve(response)
      
    } catch (error) {
      reject(error)
    }
  })
},

changeUserPassword : (userId, newPassword)=>{
  return new Promise(async(resolve, reject) => {
    try {
      newPassword = await bcrypt.hash(newPassword,10);
      let response = await db.get().collection(USER_COLLECTION).updateOne({_id: ObjectId(userId)}, {$set: {userPassword : newPassword}})

      if(response){
        resolve({status:true, msg:'Password changed successfully!'})
      }else {
        reject({status:false, msg:'Promise to change password in database didnot work as expected.'})
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

checkIfPasswordTrue : (checkPassword, userId)=>{
  return new Promise(async (resolve, reject) => {

    try {

      let userData = await db.get().collection(USER_COLLECTION).findOne({_id : ObjectId(userId)})

      if(!userData) {
        resolve({status:false, error:'User data does not exist in database. Please create an account to continue.'})
      } else {
        let status = await bcrypt.compare(checkPassword,userData.userPassword)

        if(status) {
          console.log('Passwords Match!');
          resolve({status: true, msg:'Passwords Match!'})

        }else {
          console.log('Passwords Doesnt Match!');
          resolve({status:false, msg:'Passwords Doesnot Match!!'})
        }
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

fetchOrderTotal : (userId, couponDiscount)=>{
  let discount = (parseInt(couponDiscount)|| 0)
  return new Promise(async(resolve, reject) => {
    try {

      let data = await db.get().collection(CART_COLLECTION).aggregate([
        {
          $match:{user: ObjectId(userId)}
        },
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity',
            size:'$products.size',
            time:'$products.time'
          }
        },
        {
          $lookup:{
            from:PRODUCT_COLLECTION,
            localField:'item',
            foreignField:'_id',
            as: 'productInfo'
          }
        },
        {
          $project:{
            item:1, quantity:1, size:1, time:1, product:{$arrayElemAt:['$productInfo',0]}
          }
        },
        {
          $project:{
            item:1, quantity:1, size:1, time:1, productPrice: {$toInt: '$product.productPrice'}
          }
        },
        {
          $group: {
            _id: null,
            sumTotalBeforeDisc : {$sum : {$multiply : ['$quantity', '$productPrice']}},
          }
        },
        {
          $project:{
            sumTotalBeforeDisc:1, sumTotalMultDiscount : {$multiply:['$sumTotalBeforeDisc', {$toInt : discount}]}
          }
        },
        {
          $project: {
            sumTotalBeforeDisc: 1, discountAmt : {$divide: ['$sumTotalMultDiscount', 100]}
          }
        },
        {
          $project:{
            sumTotalBeforeDisc:1, discountAmt:1, sumTotalAfterDiscount: {$subtract: ["$sumTotalBeforeDisc", "$discountAmt"]}
          }
        },
        {
          $project:{ // $ceil is used to round-up the value.
            sumTotalBeforeDisc:1, discountAmt:1, sumTotalAfterDiscount:1, taxAmt: {$ceil :{$multiply : [{$divide : ['$sumTotalAfterDiscount',100]}, 12]}}, //12 is here because GST for clothes are 12%
          }
        },
        {
          $project:{
            _id:0, sumTotalBeforeDisc:1, discountAmt:1, sumTotalAfterDiscount:1, taxAmt:1, grandTotal: {$sum:['$sumTotalAfterDiscount', '$taxAmt']}
          }
        }
      ]).toArray()

      resolve(data[0]);
      
    } catch (error) {
      console.log(error);
    }
  })
},

checkIfCouponValid : (couponCode)=>{
  return new Promise(async(resolve, reject) => {
    try {
      console.log(couponCode);
      let response = await db.get().collection(OFFER_COLLLECTION).findOne({offer: couponCode})
      console.log(response);
      if(!response || response.percentage === undefined){
        resolve({status:false, message:'Not a valid Coupon Code'})
      } else {
        resolve({status:true, message:'Entered Coupon is Valid!.', discount: response.percentage})
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

fetchUserSavedAddress : (userId)=>{
  return new Promise(async(resolve, reject)=>{
    try {
      let response = await db.get().collection(USER_COLLECTION).findOne({_id: ObjectId(userId)})
      if(response.userAddress === null){
        resolve({status:false, address: 'User has no saved address'})

      }else {
        resolve({status:true, address:response.userAddress})
      }
    } catch (error) {
      reject(error)
    }
  })
},

placeNewOrder : (orderDetails, totalAmtObj, products)=>{
  return new Promise(async(resolve, reject)=>{
    try {

      let status = orderDetails.paymentMethod === 'COD'?'placed':'pending' //if orderDetails.paymentMethod equalto COD, then status is assigned string value 'placed'. else case(if onlinePayment), status is assigned 'pending'.
      
      let orderObject = {
        deliveryDetails:{
            name: orderDetails.name,
            mobileNumber : orderDetails.mobile,
            address : orderDetails.address
        },
        userId : ObjectId(orderDetails.userId),
        paymentMethod : orderDetails.paymentMethod,
        products : products,
        totalBeforeDiscount: totalAmtObj.sumTotalBeforeDisc,
        discountCode : orderDetails.orderDiscountCode,
        discountPercent : orderDetails.orderDiscountPercent,
        discountAmount: totalAmtObj.discountAmt,
        totalBeforeTax : totalAmtObj.sumTotalAfterDiscount,
        taxAmount : totalAmtObj.taxAmt,
        grandTotalAmount : totalAmtObj.grandTotal,
        orderStatus : status,
        date: new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})
      }

      //inserting orderObject containing order details inside the 'order' collection.

      db.get().collection(ORDER_COLLECTION).insertOne(orderObject).then((response)=>{
        db.get().collection(CART_COLLECTION).deleteOne({user: ObjectId(orderDetails.userId)}).then(()=>{ //change findOne to deleteOne
          resolve({paymentMethod:orderDetails.paymentMethod,orderId:response.insertedId})
        })
      })
      .catch((error)=>{
        reject(error)
      })

    } catch (error) {
      reject(error)
    }
  })
},

getCartProductList : (userId)=>{
  return new Promise(async(resolve, reject) => {
     try {

      let cart = await db.get().collection(CART_COLLECTION).findOne({user:ObjectId(userId)});
      resolve(cart.products)
      
     } catch (error) {
      reject(error)
     }
  })
},

getRazorPay : (orderId, totalAmount)=>{
  totalAmount = totalAmount * 100;
  return new Promise((resolve, reject) => {
    try {
      let response = instance.orders.create({
                      amount: totalAmount,
                      currency: 'INR',
                      receipt: ''+orderId
                    })
      
      if(response){
        resolve(response)
      } else {
        reject({msg:'Order creation failed!'})
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

verifyRazorpayPayment : (rzpOrderObjId, rzpPaymentId, rzpPaymentSignature)=>{
  return new Promise((resolve, reject) => {
    try {

      let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET); // adding the name of algorithm and the secret key for hashing
      hmac.update(rzpOrderObjId + '|' + rzpPaymentId) // data that needs to be hashed
      hmac = hmac.digest('hex'); //converting the hashed product to hexacode string
      // console.log(hmac);
      //check if the hmac generated here matches with the hexacode signature that razorpay sent back after successful payment.
      if(hmac === rzpPaymentSignature) {
        resolve({message: 'Order verified successfully.', status:true});

      }else {
        reject({message: 'Payment not verified', status:false});
      }

    } catch (error) {
      reject(error)
    }
  })
},

changePaymentStatus : (orderId)=>{
  return new Promise((resolve, reject) => {
    try {

      let response = db.get().collection(ORDER_COLLECTION).updateOne({_id : ObjectId(orderId)},
                      {
                        $set : {
                          orderStatus : 'placed'
                        }
                      })

      if(response){
        resolve({message: 'Status updated successfully.', status:true})
      } else {
        reject({message: 'Failed to update status.', status:false})
      }
      
    } catch (error) {
      reject(error)
    }
  })
},

fetchUserOrderHistory : (userId)=>{
  return new Promise( async(resolve, reject) => {
    try {

      let orderHistory = await db.get().collection(ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
      
      if(orderHistory){
        resolve(orderHistory)
      } else {
        reject({message: 'Error while retrieveing Order History'})
      }

    } catch (error) {
      reject(error)
    }
  })
},

fetchOrderDetails : (orderId)=>{
  return new Promise(async(resolve, reject) => {
    try {

      let orderDetails = await db.get().collection(ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
      resolve(orderDetails)
      
    } catch (error) {
      reject(error)
    }
  })
},

fetchOrderItems : (orderId)=>{
  return new Promise(async(resolve, reject) => {
    try {

      let orderedProducts = await db.get().collection(ORDER_COLLECTION).aggregate([
        {
          $match: {_id:ObjectId(orderId)}
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            size: '$products.size',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project:{
              item:1,size:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        },
        {
          $project: {
            item:1,size:1,quantity:1,product:1, subTotal:{$multiply:[{$toInt: '$product.productPrice'},'$quantity']}
          }
        }
      ]).toArray()

      resolve(orderedProducts);
      
    } catch (error) {
      reject(error)
    }
  })
}


}