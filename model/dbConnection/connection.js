const mongoClient = require('mongodb').MongoClient;
const ServerApiVersion = require('mongodb').ServerApiVersion
require('dotenv').config();

const state = {
  db: null
}

module.exports.connect = function(done) {
  const url = "mongodb+srv://josepjoyal:"+process.env.MONGODB_CREDENTIAL+"@joyal.y1379a1.mongodb.net/?retryWrites=true&w=majority"
  const dbname = 'dressedup';

  mongoClient.connect(url,(err,data)=>{
    if(err){
      console.log(err);
      return done(err);
    }
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = ()=> {
  return state.db
}




// const mongoClient = require('mongodb').MongoClient
// const state = {
//   db: null
// }

// module.exports.connect = function(done) {
//   const url = 'mongodb://0.0.0.0:27017';
//   const dbname = 'dressedup';

//   mongoClient.connect(url,{useNewUrlParser : true, useUnifiedTopology : true},(err,data)=>{
//     if(err){
//       return done(err);
//     }
//     state.db = data.db(dbname);
//     done();
//   });
// };

// module.exports.get = ()=> {
//   return state.db
// }



