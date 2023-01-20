const db = require('./dbConnection/connection.js');
const { PRODUCT_COLLECTION, ORDER_COLLECTION } = require('./dbConnection/collection.js')
const {ObjectId} = require('mongodb')

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
  }
}