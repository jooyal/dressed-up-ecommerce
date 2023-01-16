require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = {
    requestOTP : (mobile)=>{
        return new Promise((resolve, reject) => {
            try {
                client.verify.v2.services(process.env.TWILIO_OTP_SERVICE_ID)
                    .verifications
                    .create({to: mobile, channel: 'sms'})
                    .then((data) => {
                        if(data.status == 'pending'){
                            resolve()
                        } else {
                            reject({status: false, error: 'OTP not sent'})
                        }
                    });

            } catch (error) {
                reject(error);
            }
        })
    },

    verifyOTP : (OTP, mobileNo)=>{
        return new Promise((resolve, reject) => {
            try {
                console.log('function invoked');
                client.verify.v2.services(process.env.TWILIO_OTP_SERVICE_ID)
                .verificationChecks
                .create({to: mobileNo, code: OTP})
                .then((data) => {
                    console.log(data);
                    if(data.status === 'approved'){
                        resolve({status:true})
                    } else {
                        resolve({status:false})
                    }
                });
                
            } catch (error) {
                reject(error)
            }
        })
    }
}