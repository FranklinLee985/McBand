var express = require('express');
var router = express.Router();
var db = require('../models/db');
var mdb = require('../models/music');
var edb = require('../models/events');
var fs=require('fs');
var formidable = require('formidable');
var path=require('path');

var musicUploadDir = '../public/resources/upload/music/';
var tempDir = '../resources/upload/temp/';
var eventUploadDir = '../public/resources/upload/event/';


function checkLogin(req,res,next){
	if(!req.session.logInfo){
		return res.redirect('/sign.html');
	}
	res.locals.logInfo = req.session.logInfo;
	next();
}

function checkNotLogin(req,res,next){
	if(req.session.logInfo){
		return res.redirect('back');
	}
	next();
}



/* GET home page. */
router.get('/', function(req, res) {
	console.log("To homepage");
	res.redirect('/index.html');
});

router.get('/index.html', function(req, res) {
	res.render('index');
});

router.get('/sign.html',checkNotLogin, function(req, res) {
	res.render('sign',{err:db.errMsg});
});


router.get('/event.html', checkLogin,function(req, res) {

	var infos = [];
	edb.connect(function(){
		edb.passevent(infos,function(){
				edb.disconnect();
				console.log(infos);
				res.render('event', {eventInfo: infos});
		});
	});
});

router.get('/musiclibrary.html', function(req, res, next) {
		var topTen = [];
		mdb.connect(function(){
		mdb.topTen(topTen,function(){
			mdb.disconnect(); 
			//console.log(topTen);
			res.render('musiclibrary',{ musicInfo: topTen });
		});
	});
});

router.post("/send-music", function(req, res){
	mdb.connect(function(){
		mdb.getAll(function(){
			mdb.disconnect();
			console.log("request get:" + mdb.musicList);  
			res.send(JSON.stringify(mdb.musicList));
		});
	});
});


router.get('/dialog.html', function(req, res, next) {
	res.render('dialog');
});

router.get('/logout', function(req, res){
	db.errMsg = '';
	req.session.logInfo = null;
	res.redirect('/sign');
});

router.post('/login_process', function(req,res){
	var response = {
		"email":req.body.email,
		"password":req.body.password
	};

	var login_msg = {
		"email":req.body.email,
		"name" : '',
		"password":req.body.password
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
		"date": req.body.time,
		"basicinfo": req.body.eventinfo,
		"eventpicture": ''
		};
		form.parse(req, function(err, fields, files){
			if(err) throw err;
			var filesUrl = [];
			var errCount = 0;
			var keys = Object.keys(files);

			response.eventcname = fields[Object.keys(fields)[0]];
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
					console.log(filesUrl);
			 
					if(key == 'event_pic') response.eventpicture = path.join('/resources/upload/event/', fileName);
					//You should self-create a folder at the upload path

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
});



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
		"password":req.body.password[0]
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


router.post('/download',function(req,res){
	var name = req.body.name;
	//DB 操作

	var filePath = "";
	var fileExt = filePath.substring(filePath.lastIndexOf('.'));
	var file = path.join(__dirname, tempDir) + name + fileExt;
	fs.renameSync(filePath, file);
	res.download(file,function(err){
		if(err) console.log(err);
		fs.unlinkSync(file);
	});
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
