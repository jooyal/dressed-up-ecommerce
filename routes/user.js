var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('userView/home', { title: 'Explore Latest Styles For You and your Home - Dressed Up', admin:true});
});

module.exports = router;