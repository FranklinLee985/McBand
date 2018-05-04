var express = require('express');
// here we require the express framework
var router = express.Router();
var mdb = require('../models/music');
var cdb = require('../models/collection');

/* GET users listing. */
router.get('/musicinfo.html', function(req, res, next) {
  res.redirect('/musiclibrary.html');
});

// this part we would like to generate music profile for each music
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

// if the "like" button is clicked at front end, we receive it here
// and further prompt to the back end
router.post('/like-check',function(req,res){
	//console.log(req.body);
	var text = req.body;
	//console.log(test);
	var userEmail = "";
	if(req.session.logInfo) userEmail= req.session.logInfo.email;
	
	cdb.connect(function(){
		cdb.isLiked({email:userEmail,musicId:text.musicId},function(){
			cdb.disconnect();
			if(cdb.liked) res.send("Undo");
			else res.send("Like");
		});
	});
});

// if the "undo" button is clicked, then we further prompt the 
//information to backend

router.post('/like-change',function(req,res){
	var userEmail = "";
	if(req.session.logInfo) userEmail= req.session.logInfo.email;
	var text = req.body;
	console.log("server received:" + JSON.stringify(text));
	cdb.connect(function(){
		cdb.isLiked({email:userEmail,musicId:text.musicId},function(){
			console.log("cdb.liked" + cdb.liked);
			if(cdb.liked){
				cdb.delete({email:userEmail,musicId:text.musicId},function(){
					cdb.disconnect();
					res.send("Like");
				})
			}
			else{
					cdb.add({email:userEmail,musicId:text.musicId},function(){
					cdb.disconnect();
					res.send("Undo");
				})
			}
		})
	})
})
module.exports = router;
