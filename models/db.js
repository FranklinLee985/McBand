var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var loginSchema = new Schema({
  email: String,
  password: String
});

var registerSchema = new Schema({
	username: String,
	email: String,
	password:String
});

var loginInfo = mongoose.model('UserDB',loginSchema);
var regInfo = mongoose.model('UserDB',regInfo);

exports.connect = function(callback){
  mongoose.connect('mongodb://localhost:27017/mcband', function(err){
    if(err){
      console.log('connect failed');
    }else{
      callback();
    }
  });
}

exports.disconnect = function(){
  mongoose.disconnect();
}

exports.search = function(login, callback){
  loginInfo.find({email: login.email }, function(err, docs){
    if(err){
      console.log('find error');
    }else{
      if(docs.length > 0){
        if(login.password === docs[0].password){
          exports.errMsg = '';
        }else{
          exports.errMsg = "Invalid password!";
        }
        callback();
      }else {
        exports.errMsg = 'Invalid username';
        callback();
      }
    }
  });
}

exports.findAll = function(callback){
	//Not sure what it is used for. Need to be checked
  loginInfo.find({}, {'username':1, '_id':0}, function(err, docs){
    if(err){
      console.log('find error');
    }else{
      exports.users = docs;
      callback();
    }
  });
}

exports.add = function(register, callback){
  if(register.password != register.checkpassword){
    exports.errMsg = "Two passwords entered don't match!";
    callback();
  }
  else{
    regInfo.find({email: register.email }, function(err, docs){
      if(err){
        console.log('find error');
      }else{
        if(docs.length > 0){
          exports.errMsg = 'Account already exists!';
          callback();
        }else {
          regInfo.create(register, function(err){
            if(err){
              console.log('add error');
            }else{
              exports.errMsg = '';
              callback();
            }
          });
        }
      }
    });
  }
}
