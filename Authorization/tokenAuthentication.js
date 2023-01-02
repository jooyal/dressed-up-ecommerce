const jwt = require('jsonwebtoken');
const { checkIfUserBlocked } = require('../model/user-helper');
const { tokenVerify } = require('../utilities/token')

module.exports = {
  userAuthorization : async (req,res,next)=>{
  
       const token = req.cookies.authToken
  
       //if no token is present in cookies
      if(!token){
        return res.render('userView/login',{title : 'Log In to your Account | Dressed Up',signupError:'Please Log In to continue.'})
      }
        console.log('******** token accessed ********');
  
      try {
        const data = await tokenVerify(token)
        
        //if no data is decoded(token might have expired or tampered with)
        if(data===null){
          console.log('no data in token');
          return res.render('userView/login',{title : 'Log In to your Account | Dressed Up',signupError:'Please Log In to continue.'})
        }

        console.log(data);

        //if user is blocked, redirect to access denied
        if(data){
          checkIfUserBlocked(data.value.userId).then(()=>{
            next();
            return;
          })
          .catch(()=>{
            return res.render('access-denied',{title : 'Sorry! user is Blocked, please contact admin to resolve. | Dressed Up',Error:'REASON : User is BLOCKED by Admin!'});
          })
        }

        // if(data.value.isBlocked===true){
        //   return res.render('access-denied',{title : 'Sorry! user is Blocked, please contact admin to resolve. | Dressed Up',Error:'REASON : User is BLOCKED by Admin!'})
        // }
  
      } catch (error) {
          console.log(error);
          return res.render('userView/login',{title : 'Log In to your Account | Dressed Up',signupError:'Please Log In to continue.'})
      }
  }
}