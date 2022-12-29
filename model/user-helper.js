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
  }
}