var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mdb = require('./music');

var commentSchema = new Schema({
	email: String,
	musicId: String,
    comment: String
});

var commentInfo = mongoose.model('commentDB',commentSchema);

exports.connect = function(callback){
	mongoose.connect('mongodb://localhost:27017/mcband', function(err){
		if(err){
			console.log('connect failed');
		}else{
			callback();
		}
	});
};

exports.disconnect = function(){
	mongoose.disconnect();
};


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
