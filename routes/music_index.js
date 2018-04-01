var express = require('express');
var router = express.Router();
var mdb = require('../models/music');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('musiclibrary');
});

module.exports = router;
