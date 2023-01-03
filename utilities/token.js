const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = {
    userTokenGenerator : async(payload)=>{        
        try {
          const accessToken = await jwt.sign({value: payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '900s'})
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
    
    checkTokenExpired : async (token)=>{
      try {
        // Decode the token
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        // Check the expiration date of the token
        const expirationDate = new Date(decodedToken.exp * 1000); // the exp value is in seconds, so convert to milliseconds

        if(expirationDate < new Date()) console.log('token expired');
        
        return (expirationDate < new Date().getTime());

      } catch (error) {
        console.log(error)
      }
    }
}