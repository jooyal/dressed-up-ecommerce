const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION, USER_COLLECTION } = require('./dbConnection/collection.js')
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
  }
}