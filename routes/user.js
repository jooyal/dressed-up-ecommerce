var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',(req, res, next)=> {
  res.render('userView/home', { title: 'Explore Latest Styles For You and your Home - Dressed Up'});
});

module.exports = router;