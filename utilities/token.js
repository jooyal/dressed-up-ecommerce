const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = {
    userTokenGenerator : async(payload)=>{        
        try {
          const accessToken = await jwt.sign({value: payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
          return accessToken

        } catch (error) {
          console.log(error);
      }
    },

    tokenVerify : async(token)=>{
      try {
        let tokenPayload = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        return tokenPayload

      } catch (error) {
        console.log(error);
      }
    }
}