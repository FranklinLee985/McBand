var express = require('express');
var router = express.Router();
var mdb = require('../models/music');

/* GET users listing. */
router.get('/musicinfo.html', function(req, res, next) {
  res.redirect('/musiclibrary.html');
});

router.get('/musicinfo.html', function(req, res, next) {
  res.redirect('back');
});

router.get('/music/:mid',function(req,res,next){
	var result = [];
	var str = req.originalUrl;
	var mid = str.substring(str.lastIndexOf("/")+1);
	console.log("mid:" + mid + "str:" + str);
	mdb.connect(function(){
		mdb.search(mid,result,function(){
			if(result[0] == null) res.redirect('back');
			else{
				console.log("result:" + result[0]);
				res.render('musicinfo',{musicInfo:result[0]});
			}
		})
	})
});


module.exports = router;
