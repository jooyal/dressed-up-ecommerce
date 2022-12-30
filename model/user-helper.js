const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION } = require('./dbConnection/collection.js')
const {ObjectId} = require('mongodb')

module.exports = {
  fetchHomeProducts : (category)=>{
    return new Promise((resolve, reject) => {
      try {
        let homeProducts = db.get().collection(PRODUCT_COLLECTION).find({productCategory:category}).limit(4).toArray()
        resolve(homeProducts)
      } catch (error) {
        reject(error)
      }
    })
  },
  fetchCategoryProducts : (category)=>{
    return new Promise((resolve, reject) => {
      try {
        let allProducts = db.get().collection(PRODUCT_COLLECTION).find({productCategory : category}).toArray()
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
    return new Promise((resolve, reject) => {
      try {
        let items = db.get().collection(PRODUCT_COLLECTION).find({productCategory : category, productType : type}).limit(4).toArray()
        resolve(items)
      } catch (error) {
        reject(error)
      }
    })
  }
}