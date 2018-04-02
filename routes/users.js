var express = require('express');
var router = express.Router();
var db = require('../models/db');

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
	var por = '';
	db.connect(function(){
		db.getPortrait(res.locals.logInfo.email,por,function(){
			db.disconnect();
			console.log(por);
			res.render('account',{portrait:por});
		});
	});

  
});
module.exports = router;
