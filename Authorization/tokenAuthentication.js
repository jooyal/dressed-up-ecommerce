const jwt = require('jsonwebtoken');
const path = require('path');

const parentDir = (path.resolve(__dirname, '..'));
const { checkIfUserBlocked } = require(parentDir + '/model/user-helper');
const { tokenVerify, checkTokenExpired, checkAdminTokenExpired, adminTokenVerify } = require(parentDir + '/utilities/token')

module.exports = {
  userAuthorization : async (req,res,next)=>{
  
       const token = req.cookies.authToken

       //if no token is present in cookies or if token expired, render login page.

      if(!token || checkTokenExpired(token)===true){
        return res.render('userView/login',{title : 'Log In to your Account | Dressed Up',loginError:'Please Log In to continue.'})
      }

        console.log('******** token accessed ********');
  
      try {
        const data = await tokenVerify(token)
        
        //if no data is decoded(or token might have expired or tampered with)
        if(!data){
          console.log('no data in token');
          //if no data in token, delete cookie.
          res.clearCookie('authToken')
          return res.status(403).render('userView/login',{title : 'Log In to your Account | Dressed Up',loginError:'Please Log In to continue.'})
        }

        //console.log(data);

        //if user is blocked, redirect to access denied
        if(data){
          checkIfUserBlocked(data.value.userId).then(()=>{
            next();
            return;
          })
          .catch(()=>{
            return res.status(403).render('access-denied',{title : 'Sorry! user is Blocked, please contact admin to resolve. | Dressed Up',Error:'REASON : User is BLOCKED by Admin!'});
          })
        }

        // if(data.value.isBlocked===true){
        //   return res.render('access-denied',{title : 'Sorry! user is Blocked, please contact admin to resolve. | Dressed Up',Error:'REASON : User is BLOCKED by Admin!'})
        // }
  
      } catch (error) {
          console.log(error);
          return res.render('userView/login',{title : 'Log In to your Account | Dressed Up',loginError:'Please Log In to continue.'})
      }
  },

  checkIfValidTokenExist : (req)=>{
    const token = req.cookies.authToken

    //if no token is present in cookies or if token expired, return false.

    if(checkTokenExpired(token)===true || !token){
      return false
    }else {
      return true
    }
  },

  // admin authorization

  adminAuthorization : async(req,res,next)=>{

        const token = req.cookies.authToken
       //if no token is present in cookies or if token expired, render access denied page.
      if(!token || checkAdminTokenExpired(token)===true){
        return res.render('access-denied',{title : 'Only Admin Have Access To This Page!'})
      }
        console.log('******** admin token accessed ********');

        try {
          const data = await adminTokenVerify(token)

          //if no data is decoded(or token might have expired or tampered with)
          if(!data){
            console.log('no data in token');
            //if no data in token, delete cookie.
            res.clearCookie('authToken')
            return res.status(403).render('access-denied',{title : 'Login Token Has Expired Or Been Tampered! Please Try Again.'})
            
          }else {
            console.log('admin-authorized');
            next();
            return          
          }
        } catch(error) {
          console.log(error);
        }
  },






}
