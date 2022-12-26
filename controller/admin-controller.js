
module.exports = {
  getAdminHome : (req,res)=> {
    res.render('adminView/admin-home',{admin:true})
  }
}