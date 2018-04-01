var express = require('express');
var router = express.Router();
var db = require('../models/db');
var mdb = require('../models/music');
var fs=require('fs');
var formidable = require('formidable');
var path=require('path');

var musicUploadDir = '../resources/upload/music/';
var tempDir = '../resources/upload/temp/';


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
router.get('/', function(req, res, next) {
  console.log("To homepage");
  res.redirect('/index.html');
});

router.get('/index.html', function(req, res, next) {
  res.render('index');
});

router.get('/sign.html',checkNotLogin, function(req, res, next) {
  res.render('sign');
});

router.get('/account.html', checkLogin,function(req, res, next) {
  res.render('account');
});

router.get('/community.html', checkLogin,function(req, res, next) {
  res.render('community');
});

router.get('/event.html', checkLogin,function(req, res, next) {
  res.render('event');
});

router.get('/musiclibrary.html', function(req, res, next) {
  res.render('musiclibrary');
});

router.get('/musicinfo.html', function(req, res, next) {
  res.render('musicinfo');
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
        //console.log(filesUrl);

        if(key == 'audiofile') music.musicPath = targetFile;
        if(key == 'coverpic') music.coverPath = targetFile;
        if(key == 'sheetmusic') music.sheetPath = targetFile;
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
  
})



module.exports = router;
