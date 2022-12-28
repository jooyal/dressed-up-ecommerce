
module.exports = {
  getAdminHome : (req,res)=> {
    res.render('adminView/admin-home',{admin:true})
  },
  getAddProduct : (req,res)=> {
    res.render('adminView/add-product',{admin:true})
  },
  postAddProduct : (req,res)=> {
    console.log(req.body)
    console.log(req.files.productImage1)
    
  }
}