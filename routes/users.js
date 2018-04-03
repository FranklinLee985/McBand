var express = require('express');
var router = express.Router();
var db = require('../models/db');
var cdb = require('../models/collection')

var iconUploadDir = '../public/resources/upload/portraits/';

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

/* GET users listing. */

router.get('/account.html', checkLogin,function(req, res, next) {
	res.redirect('/users/' + res.locals.logInfo.name);
});

router.get('/users/',checkLogin,function(req, res, next) {
	res.redirect('/users/' + res.locals.logInfo.name);
});

router.get('/users/:name',checkLogin,function(req, res, next) {
	var ptr = {
		por:''
	};
	var collection = [];
	var str = req.originalUrl;
	var name = str.substring(str.lastIndexOf("/")+1);
	db.connect(function(){
		db.getPortrait(name,ptr,function(){
			db.disconnect();
			cdb.connect(function(){
				cdb.showAll(name,collection,function(){
					cdb.disconnect();
					//console.log(collection);
					res.render('account',{portrait:ptr.por,collec:collection});
				})
			})
		});
	});  
});

router.post('/icon_upload',checkLogin,function(req,res,next){
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	//form.uploadDir = path.normalize(musicUploadDir);
	form.maxFilesSize = 2*1024*1024;
	form.keepExtensions = true;
	form.multiples=true;
	var targetDir = path.join(__dirname, iconUploadDir);
	fs.access(targetDir, function(err){
		if(err){
			fs.mkdirSync(targetDir);
		}
		_fileParse();
	});


	function _fileParse() {
		var icon = {
			"username":req.session.logInfo.email,
			"portraitPath":'/resources/upload/portraits/default.png'
		}
		form.parse(req, function (err, fields, files) {
			if (err) throw err;
				var filesUrl = [];
				var errCount = 0;
				var keys = Object.keys(files);

			keys.forEach(function(key){
			console.log("key:"+key);
			var filePath = files[key].path;
			var fileExt = filePath.substring(filePath.lastIndexOf('.'));
			var fileName = key +"_"+ new Date().getTime() + fileExt;
			var targetFile = path.join(targetDir, fileName);
			console.log(targetDir)
			//移动文件
			fs.renameSync(filePath, targetFile);
			// 文件的Url（相对路径）
			filesUrl.push('/portraits/'+fileName);
			console.log("Here is the path!");
			console.log(filesUrl);

			if(key == 'iconPath') icon.portraitPath = path.join('/resources/upload/portraits/', fileName);

			});
			console.log("portraitPath" + portraitPath);

			// 返回上传信息
			//res.json({filesUrl:filesUrl, success:keys.length-errCount, error:errCount});

			//add to DB
			db.connect(function(){
				db.updatePortrait(icon,function(){
					db.disconnect();
					res.redirect('/users');
				})
			});

		}); 
	} 
})

module.exports = router;
