var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
	username: String,
	email: String,
	password:String,
  portraitPath:String
});

var userInfo = mongoose.model('UserDB',userSchema);

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

exports.search = function(login, login_msg,callback){
  userInfo.find({email: login.email }, function(err, docs){
    if(err){
      console.log('find error');
    }else{
      if(docs.length > 0){
        if(login.password === docs[0].password){
          exports.errMsg = '';
          login_msg.name = docs[0].username;
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

exports.getPortrait = function(userEmail,por,callback){
  userInfo.find({email:userEmail},function(err,docs){
    if(err) console.log(err);
    else{
      console.log('in DB:' + docs[0].portraitPath);
      por = docs[0].portraitPath;
      callback();
    }
  })
}

exports.findAll = function(callback){
	//Not sure what it is used for. Need to be checked
  userInfo.find({}, {'username':1, '_id':0}, function(err, docs){
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
    userInfo.find({email: register.email }, function(err, docs){
      if(err){
        console.log('find error');
      }else{
        if(docs.length > 0){
          exports.errMsg = 'Account already exists!';
          callback();
        }else {
          var data = new userInfo({
            username:register.name,
            email:register.email,
            password:register.password,
            portraitPath:'/resources/upload/protraits/default.png'
          });
          data.save(function(err){
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
