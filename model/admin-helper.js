const express = require('express');
const router = express.Router();
const { getAdminHome } = require('../controller/admin-controller')

/* GET home page. */
router.get('/',getAdminHome)

module.exports = router;