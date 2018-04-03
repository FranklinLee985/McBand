var express = require('express');
var router = express.Router();
var mdb = require('../models/music');
var cdb = require('../models/collection');

/* GET users listing. */
router.get('/musicinfo.html', function(req, res, next) {
  res.redirect('/musiclibrary.html');
});

router.get('/music/', function(req, res, next) {
  res.redirect('back');
});

router.get('/music/:mid',function(req,res,next){
	res.locals.logInfo = req.session.logInfo;
	if(!req.session.logInfo) res.redirect('/sign.html'); 
	var result = [];
	var str = req.originalUrl;
	var mid = str.substring(str.lastIndexOf("/")+1);
	console.log("mid:" + mid + "str:" + str);
	mdb.connect(function(){
		mdb.search(mid,result,function(){
			if(result[0] == null) res.redirect('back');
			else{
				mdb.disconnect();
				cdb.connect(function(){
					cdb.isLiked({email:req.session.logInfo.email,musicId:mid},function(){
						console.log("result:" + result[0] + cdb.liked);
						res.render('musicinfo',{musicInfo:result[0],isLike:cdb.liked});
					})
				})
			}
		})
	})
});


module.exports = router;
