var express = require('express');
var router = express.Router();
var db = require('../db/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("To homepage");
});

router.get('/index.html', function(req, res, next) {
  console.log("To homepage");
  res.redirect(302,'.')
});

router.get('/sign', function(req, res, next) {
  console.log("To homepage");
  res.redirect(302,'/sign.html')
});

router.get('/account', function(req, res, next) {
  console.log("To homepage");
  res.redirect(302,'/account.html')
});

router.post('/login_process', function(req,res){
	var response = {
		"email":req.body.email,
		"password":req.body.password
	};
	console.log(response);
	//Find data inside DB
    db.connect(function(){
        db.search(response,function(){
            db.disconnect();
            if(db.errMsg === ''){
                req.session.logInfo = response;
                //登录成功，跳转到account页面
                res.redirect('/account');
            }
            else{
                //登录失败
                res.redirect('/sign');
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
                res.redirect('/account');
            }
            else{
                res.redirect('/sign');
                console.log(db.errMsg);
            }
        })
    })
})

module.exports = router;
