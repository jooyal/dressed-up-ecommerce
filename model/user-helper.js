const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION, USER_COLLECTION, CART_COLLECTION } = require('./dbConnection/collection.js')
const {ObjectId} = require('mongodb')
const bcrypt = require('bcrypt');

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
  fetchRecCategoryAndType : (id)=>{
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

  doSignUp : (data)=>{
    return new Promise(async (resolve, reject) => {
      try {

        let checkIfEmailExist = await db.get().collection(USER_COLLECTION).findOne({userEmail:data.userEmail})
        let checkIfMobileExist = await db.get().collection(USER_COLLECTION).findOne({userMobile:data.userMobile})
        //console.log(checkIfEmailExist);

        if(checkIfEmailExist !== null) {
          resolve({status:false, error: 'Account already exist with this email, do sign-in instead.'})
        }else if(checkIfMobileExist !== null) {
          resolve({status:false, error: 'Account already exist with this Mobile Number, do sign-in instead.'})
        }else {
          data.userMobile = '+91' + data.userMobile
          data.isBlocked = false
          data.userAddress = null;
          delete data.confirmUserPassword
          delete data.termsCheckBox
          //hashing password
          data.userPassword = await bcrypt.hash(data.userPassword,10);

          let response = await db.get().collection(USER_COLLECTION).insertOne(data)

          if(response) {
            //console.log(response.insertedId);
            resolve({status:true, userId:response.insertedId})
          }else {
            reject({error: "Couldn't insert data to Database"})
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

    let productObject = {
      item: ObjectId(productId),
      size: productSize,
      quantity: (productQuantity || 1),
      time: new Date().getTime()
    }
    console.log(productObject);
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
          console.log(cartExistCheck);

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




}