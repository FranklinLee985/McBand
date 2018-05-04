var express = require('express');
// we require the express framework to manage our databse
var router = express.Router();
// here we give each database a name
var db = require('../models/db');
var mdb = require('../models/music');
var edb = require('../models/events');
var coldb = require('../models/collection');
var fs=require('fs');
var formidable = require('formidable');
var path=require('path');

// here we define the relative path to store the music and pictures
var musicUploadDir = '../public/resources/upload/music/';
var tempDir = '../resources/upload/temp/';
var eventUploadDir = '../public/resources/upload/event/';

// here we check the session to see whether the user has logged in
function checkLogin(req,res,next){
	if(!req.session.logInfo){
		return res.redirect('/sign.html');
	}
	res.locals.logInfo = req.session.logInfo;
	next();
}

// if the user has not logged in, then we redirect him to the login page
function checkNotLogin(req,res,next){
	if(req.session.logInfo){
		return res.redirect('back');
	}
	next();
}



/* GET home page. */
router.get('/', function(req, res) {
	console.log("To homepage");
	res.locals.logInfo = req.session.logInfo
	res.redirect('/index.html');
});

//if /index is detected in http, we relocate to index page
router.get('/index.html', function(req, res) {
	res.locals.logInfo = req.session.logInfo
	res.render('index');
});

//if /sign is detected, we redirect to sign page
router.get('/sign.html',checkNotLogin, function(req, res) {
	res.locals.logInfo = req.session.logInfo
	res.render('sign',{err:db.errMsg});
});

//if /event is detected, we redirect to event page
router.get('/event.html', checkLogin,function(req, res) {

	var infos = [];
	edb.connect(function(){
		edb.passevent(infos,function(){
				edb.disconnect();
				console.log("hello nih ao"+infos);
				res.render('event', {eventInfo: infos});
		});
	});
});

//if the /musiclibrary is detected, then redirect to music info page
router.get('/musiclibrary.html', checkLogin,function(req, res, next) {
	res.locals.logInfo = req.session.logInfo;
	var email = "";
	if(req.session.logInfo)  email = req.session.logInfo.email;
	var topTen = [];
	mdb.connect(function(){
		//console.log("mdb connected!");
		mdb.topTen(topTen,function(){
			//console.log("top ten:" + topTen);
			mdb.disconnect(); 
			res.render('musiclibrary',{ musicInfo: topTen});
		});
	});
});

// here we would like to send music to our database
router.post("/send-music", function(req, res){
	mdb.connect(function(){
		mdb.getAll(function(){
			mdb.disconnect();
			//console.log("request get:" + mdb.musicList);  
			res.send(JSON.stringify(mdb.musicList));
		});
	});
});

// here we receive event information and add to event databse in mongodb
router.post("/send-event", function(req, res){
    edb.connect(function(){
        edb.getAll(function(){
            edb.disconnect();
            res.send(JSON.stringify(edb.eventList));
        });
    });
});

router.get('/dialog.html', checkLogin,function(req, res, next) {
	console.log(res.locals.logInfo);
	res.render('dialog');
});

// if logout is clicked, the user is prompted to login page
router.get('/logout', function(req, res){
	db.errMsg = '';
	req.session.logInfo = null;
	res.redirect('/sign.html');
});

// here is the login process, if successfulful, then redirect to 
// account home page
router.post('/login_process', function(req,res){
	var response = {
		"email":req.body.email,
		"password":req.body.password
	};

	var login_msg = {
		"email":req.body.email,
		"name" : '',
		"password":req.body.password,
		"portraitPath":'/resources/upload/portraits/default.png',
	};
	console.log(response);
	//Find data inside DB
	db.connect(function(){
		db.search(response,login_msg,function(){
			db.disconnect();
			if(db.errMsg === ''){
				req.session.logInfo = login_msg;
				//登录成功，跳转到account页面
				res.redirect('/account.html');
			}
			else{
				//登录失败
				res.redirect('/sign.html');
				console.log(db.errMsg);
			}
		})
	})
})


router.post('/event_upload', checkLogin);
router.post('/event_upload', function(req,res){

	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.maxFilesSize = 10*1024*1024;
	form.keepExtensions = true;
	form.multiples = true;
	var targetDir = path.join(__dirname, eventUploadDir);
	fs.access(targetDir, function(err){
			if(err){
					fs.mkdirSync(targetDir);
			}
			_fileParse();
	});

	function _fileParse() {
		var response = {
		"username":req.session.logInfo.name,
		"eventname": req.body.eventname,
		"venue": req.body.venue,
		"time": req.body.time,
		"eventinfo": req.body.eventinfo,
		"eventpicture": ''
		}
		form.parse(req, function(err, fields, files){
			if(err) throw err;
			var filesUrl = [];
			var errCount = 0;
			var keys = Object.keys(files);

			response.eventname = fields[Object.keys(fields)[0]];
			response.venue = fields[Object.keys(fields)[1]];
			response.time = fields[Object.keys(fields)[2]];
			response.eventinfo = fields[Object.keys(fields)[3]];

			keys.forEach(function(key){
					console.log(key);
					var filePath = files[key].path;
					var fileExt = filePath.substring(filePath.lastIndexOf('.'));
					var fileName = key + "_"+ new Date().getTime() + fileExt;
					var targetFile = path.join(targetDir, fileName);
					console.log(targetDir)
					fs.renameSync(filePath, targetFile);
					filesUrl.push('/event/'+fileName);
					console.log("Here is the path");
					//console.log(filesUrl);
					//You should self-create a folder at the upload path
                    if (key == 'event_pic') response.eventpicture = path.join('/resources/upload/event/', fileName);

			});
			console.log(response);
			// add to DB
			edb.connect(function(){
				edb.add(response, function(){
					edb.disconnect();
					if(edb.errMsg == ''){
							//Successfully upload the event, redirect to event interface
							res.redirect('/event.html');
					}
					else{
							res.redirect('/event.html');
							console.log(edb.errMsg);
					}
				});
			});
		});
	}

})


// here we get the register information from the html front end
router.post('/register_process', function(req,res){
	var response = {
		"name":req.body.name,
		"email":req.body.email,
		"password":req.body.password[0],
		"checkpassword":req.body.password[1]
	};
	var login_msg = {
		"email":req.body.email,
		"name" : req.body.name,
		"password":req.body.password[0],
		"portraitPath":"/resources/upload/portraits/default.png"
	};
	console.log(response);
	//res.end(JSON.stringify(response));
	db.connect(function(){
		db.add(response,function(){
			db.disconnect();
			if(db.errMsg === ''){
				req.session.logInfo = login_msg;
				//注册成功，跳转到account页面
				res.redirect('/account.html');
			}
			else{
				res.redirect('/sign.html');
				console.log(db.errMsg);
			}
		})
	})
})




// The following is to store the music, pic, sheet to local files

router.post('/music_upload',checkLogin);
router.post('/music_upload',function(req,res,next){

	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	//form.uploadDir = path.normalize(musicUploadDir);
	form.maxFilesSize = 10*1024*1024;
	form.keepExtensions = true;
	form.multiples=true;
	var targetDir = path.join(__dirname, musicUploadDir);
	fs.access(targetDir, function(err){
		if(err){
			fs.mkdirSync(targetDir);
		}
		_fileParse();
	});



	 // 文件解析与保存
	function _fileParse() {
		var music = {
			"username":req.session.logInfo.name,
			"musicname":'',
			"musicPath":'',
			"coverPath":'',
			"sheetPath":''

		}
		form.parse(req, function (err, fields, files) {
			if (err) throw err;
				var filesUrl = [];
				var errCount = 0;
				var keys = Object.keys(files);

				music.musicname = fields[Object.keys(fields)[0]];

			keys.forEach(function(key){
			console.log(key);
			var filePath = files[key].path;
			var fileExt = filePath.substring(filePath.lastIndexOf('.'));
			var fileName = key +"_"+ new Date().getTime() + fileExt;
			var targetFile = path.join(targetDir, fileName);
			console.log(targetDir)
			//移动文件
			fs.renameSync(filePath, targetFile);
			// 文件的Url（相对路径）
			filesUrl.push('/music/'+fileName);
			console.log("Here is the path!");
			console.log(filesUrl);

			if(key == 'audiofile') music.musicPath = path.join('/resources/upload/music/', fileName);
			if(key == 'coverpic') music.coverPath = path.join('/resources/upload/music/', fileName);
			if(key == 'sheetmusic') music.sheetPath = path.join('/resources/upload/music/', fileName);
			});
			console.log(music);

			// 返回上传信息
			//res.json({filesUrl:filesUrl, success:keys.length-errCount, error:errCount});

			//add to DB
			mdb.connect(function(){
				mdb.add(music,function(){
					mdb.disconnect();
					if (mdb.errMsg === ''){
						//Successfully upload the music, redirect to muisclibrary interface
						res.redirect('/musiclibrary.html');
					}
					else{
						res.redirect('/musiclibrary.html');
						console.log(mdb.errMsg);
					}
				})
			});

		}); 
	}
	
});



module.exports = router;
