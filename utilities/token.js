const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = {
    userTokenGenerator : async(payload)=>{        
        try {
          const accessToken = await jwt.sign({value: payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'})
          return accessToken

        } catch (error) {
          console.log(error);
      }
    },

    adminTokenGenerator : async(payload)=>{
      try {
        const accessToken = await jwt.sign({value: payload}, process.env.ADMIN_TOKEN_SECRET, {expiresIn: '3600s'})
        return accessToken

      } catch (error) {
        console.log(error);
    }
  },

    tokenVerify : async(token)=>{
      try {
        let decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        return decodedToken

      } catch (error) {
        console.log(error);
      }
    },

    adminTokenVerify : async(token)=>{
      try {
        let decodedToken = await jwt.verify(token,process.env.ADMIN_TOKEN_SECRET)
        return decodedToken

      } catch (error) {
        console.log(error);
      }
    },
    
    checkTokenExpired : async (token)=>{
      try {
        // Decode the token
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken){
          return true
        } else {

          // Check the expiration date of the token
          const expirationDate = new Date(decodedToken.exp * 1000); // the exp value is in seconds, so convert to milliseconds

          if(expirationDate < new Date().getTime()) console.log('token expired');
          
          return (expirationDate < new Date().getTime());

        }

      } catch (error) {
        console.log(error)
      }
    },

    checkAdminTokenExpired : async (token)=>{
      try {
        // Decode the token
        const decodedToken = await jwt.verify(token,process.env.ADMIN_TOKEN_SECRET)
        if(!decodedToken){
          return true
        } else {

          // Check the expiration date of the token
          const expirationDate = new Date(decodedToken.exp * 1000); // the exp value is in seconds, so convert to milliseconds

          if(expirationDate < new Date().getTime()) console.log('token expired');
          
          return (expirationDate < new Date().getTime());

        }

      } catch (error) {
        console.log(error)
      }
    }


}