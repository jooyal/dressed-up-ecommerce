const { addProduct, addProductImage, fetchAllProducts, fetchAllOrders, doEditProductDetails, editProductImage, editProductImage1, editProductImage2, editProductImage3, editProductImage4 } = require('../model/admin-helper.js')
const path = require('path');
const { fetchOrderItems, fetchOrderDetails, fetchProductDetails } = require('../model/user-helper.js');
const e = require('express');

module.exports = {

  getAddProduct : (req,res)=> {
    let title = 'Add New Product | Admin | Dressed Up'
    res.render('adminView/add-product', {title, admin:true})
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
      // console.log(products)
      let title = 'View All Products | Admin | Dressed Up'
      res.render('adminView/product-list',{products, title, admin:true})
    } catch (error) {
      console.log(error)
    }
  },

  
  getEditProductDetails : async(req,res)=>{
    try {
      let title = 'Edit Product details | Admin | Dressed Up';
      let productId = req.params.id;
      let productData = await fetchProductDetails(productId)

      res.render('adminView/edit-product',{title, productData, admin:true})
      
    } catch (error) {
      console.log(error);
    }
  },

  postEditProductDetails : async(req,res)=>{
    try {

      let response = await doEditProductDetails(req.body);

      if(req.files !== null){

        if(req.files.productImage1 !== undefined){
          let image1 = req.files.productImage1
          let imageName1 = req.body.productId + 1 + path.extname(image1.name);
          await image1.mv('./public/productImages/' + imageName1)
          let imageResponse = editProductImage1(req.body.productId, imageName1)
        }
        if(req.files.productImage2 !== undefined){
          let image2 = req.files.productImage2
          let imageName2 = req.body.productId + 2 + path.extname(image2.name);
          await image2.mv('./public/productImages/' + imageName2)
          let imageResponse = editProductImage2(req.body.productId, imageName2)
        }
        if(req.files.productImage3 !== undefined){
          let image3 = req.files.productImage3
          let imageName3 = req.body.productId + 3 + path.extname(image3.name);
          await image3.mv('./public/productImages/' + imageName3)
          let imageResponse = editProductImage3(req.body.productId, imageName3)
        }
        if(req.files.productImage4 !== undefined){
          let image4 = req.files.productImage4
          let imageName4 = req.body.productId + 4 + path.extname(image4.name);
          await image4.mv('./public/productImages/' + imageName4)
          let imageResponse = editProductImage4(req.body.productId, imageName4)
        }

      }else{
        console.log('no image found');
      }

    if(response){
      res.redirect('/admin/all-products')
    }
      
    } catch (error) {
      console.log(error);
    }
  },

  postDeleteSelectedProduct : async(req,res)=>{
    try {
      let response = await 0
      
    } catch (error) {
      console.log(error);
    }
  }



}