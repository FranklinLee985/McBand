// we use mongoose to manage mongodb database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This defines the schema of user information
var userSchema = new Schema({
	username: String,
	email: String,
	password:String,
	portraitPath:String
});

var userInfo = mongoose.model('UserDB',userSchema);


// connect to mongdb
exports.connect = function(callback){
	mongoose.connect('mongodb://localhost:27017/mcband', function(err){
		if(err){
			console.log('connect failed');
		}else{
			callback();
		}
	});
}

// disconnect a certain database
exports.disconnect = function(){
	mongoose.disconnect();
}

//search for the users by email address
//If the user exists, then report error message, otherwise update
//the user database
exports.search = function(login, login_msg,callback){
	userInfo.find({email: login.email }, function(err, docs){
		if(err){
			console.log('find error');
		}else{
			if(docs.length > 0){
				if(login.password === docs[0].password){
					exports.errMsg = '';
					login_msg.name = docs[0].username;
					login_msg.portraitPath = docs[0].portraitPath;
				}
				else{
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


//Here we store the portrait path in our local server
//We don't store png files in our mongodb database
exports.getPortrait = function(userName,ptr,callback){
	userInfo.find({username:userName},function(err,docs){
		if(err) console.log(err);
		else{
			//console.log('in DB:' + docs[0].portraitPath);
			ptr.por = docs[0].portraitPath;
			//console.log('porPath:' + ptr.por);
			callback();
		}
	})
}


// Here we update our portrait if necessary
exports.updatePortrait = function(infos,callback){

	userInfo.find({email:infos.useremail},function(err,docs){
		if(err) console.log(err);
		else{
			//console.log("bbbbbbbbbb"+infos.useremail);
			//console.log("aaaaaaaaaaaaaaaaaaa"+docs[0]);
			userInfo.update({email:infos.useremail},{portraitPath:infos.portraitPath},{multi:false},function(err,rec){
				if(err) console.log(err);
				else{
					//console.log("aaaaaaaaaaaaaaaaaaa"+rec.email);
					console.log("update success! "+rec);
					callback();
				}
			})
		}

	})
}

// Here we want to find all the existing users
// This function here further help to generate user list and chat box
exports.findAll = function(callback){
	//Not sure what it is used for. Need to be checked
	userInfo.find({}, function(err, docs){
		if(err){
			console.log('find error');
		}else{
			exports.users = docs;
			callback();
		}
	});
};

// Here we use regular expression to check whether the input email
// and the password 
exports.add = function(register, callback){
	var PWfilter  = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,21}$/;
	var EMfilter  = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
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
				}
				else if(!EMfilter.test(register.email)){
					exports.errMsg = 'Incorrect email addrress!';
					callback();
				}
				else if(!PWfilter.test(register.password)){
					exports.errMsg = 'Please enter a password with 6~21 chars, cannot include only numbers or characters!';
					callback();
				}
				else {
					var data = new userInfo({
						username:register.name,
						email:register.email,
						password:register.password,
						portraitPath:'/resources/upload/portraits/default.png'
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
