const { addProduct, addProductImage, fetchAllProducts } = require('../model/admin-helper.js')
const path = require('path');

module.exports = {
  getAddProduct : (req,res)=> {
    res.render('adminView/add-product',{admin:true})
  },
  postAddProduct : (req,res)=> {
    addProduct(req.body).then(async (insertedId)=>{
      
      let image1 = req.files.productImage1
      let image2 = req.files.productImage2
      let image3 = req.files.productImage3
      let image4 = req.files.productImage4

      let imageName1 = insertedId + 1 + path.extname(image1.name);
      await image1.mv('./public/productImages/' + imageName1)

      let imageName2 = insertedId + 2 + path.extname(image2.name);
      await image2.mv('./public/productImages/' + imageName2)

      let imageName3 = insertedId + 3 + path.extname(image3.name);
      await image3.mv('./public/productImages/' + imageName3)

      let imageName4 = insertedId + 4 + path.extname(image4.name);
      await image4.mv('./public/productImages/' + imageName4)
      
      try {
        await addProductImage(insertedId,imageName1,imageName2,imageName3,imageName4)
        res.redirect('/admin/add-product')

      } catch (error) {
        console.log(error);
      }
    })
    .catch((err)=>{
      console.log(err)
    })
  },
  getAllProducts : async (req,res)=>{
    try {
      let products = await fetchAllProducts()
      console.log(products)
      res.render('adminView/product-list',{products,admin:true})
    } catch (error) {
      console.log(error)
    }
  }


}