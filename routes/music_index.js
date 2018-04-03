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
				res.render('musicinfo',{musicInfo:result[0]});
			}
		})
	})
});

router.post('/like-check',function(req,res){
	var userEmail = req.session.logInfo.email;
	var text = JSON.parse(req.body.text);
	console.log("server received:" + text);
	cdb.connect(function(){
		cdb.isLiked({email:userEmail,musicId:text.musicId},function(){
			cdb.disconnect();
			if(cdb.liked) res.send("Unlike");
			else res.send("Like");
		});
	});
});

router.post('/like-change',function(req,res){
	var userEmail = req.session.logInfo.email;
	var text = JSON.parse(req.body.text);
	cdb.connect(function(){
		cdb.isLiked({email:userEmail,musicId:text.musicId},function(){
			if(cdb.liked){
				cdb.delete({email:userEmail,musicId:text.musicId},function(){
					cdb.disconnect();
					res.send("Like");
				})
			}
			else{
					cdb.add({email:userEmail,musicId:text.musicId},function(){
					cdb.disconnect();
					res.send("Unlike");
				})
			}
		})
	})
})
module.exports = router;
