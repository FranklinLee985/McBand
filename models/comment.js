// use mongoose to manage mongodb
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mdb = require('./music');


// here we define the schema of comment
var commentSchema = new Schema({
	email: String,
	musicId: String,
    comment: String
});

var commentInfo = mongoose.model('commentDB',commentSchema);

// here we would like to connect to database 
exports.connect = function(callback){
	mongoose.connect('mongodb://localhost:27017/mcband', function(err){
		if(err){
			console.log('connect failed');
		}else{
			callback();
		}
	});
};


//here we disconnect the database
exports.disconnect = function(){
	mongoose.disconnect();
};

// delete a comment, but the authority is needed
exports.deleteComment = function(infos,callback){
	commentInfo.remove({email:infos.email,musicId:infos.musicId,comment:infos.comment},function(err){
		if(err){
			console.log("No such comment record!");
		}
		else{
			console.log("Remove success!");
			exports.errmsg = '';
		}
	})
};


// here we would like to show all the comments
exports.showAll = function(userEmail,result,callback){
	commentInfo.find({email:userEmail},function(err,docs){
		if(err)console.log(err);
		else{
			docs.forEach(function(doc){
				console.log(doc);
				result.push(doc);
                //Is this function to put selected data to front end
			});
			callback();
		}
	});
}


// here we add a comment to database
exports.add = function(infos, callback) {
    var commentdata = new commentInfo({
	    email: infos.useremail,
	    musicId: infos.musicname,
        comment: infos.comment
    });

    commentdata.save(function(err){
        if(err){
            console.log('add error');
        }else{
            exports.errMsg = '';
            callback();
        }
    })
}
