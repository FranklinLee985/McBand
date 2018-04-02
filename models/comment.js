var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mdb = require('../models/music');

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

exports.delete = function(infos,callback){
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
	
	commentInfo.find({email:infos.email,musicId:infos.musicId,comment:infos.comment},function(err,docs){
		if(err)console.log(err);
		else{
			if(docs.length > 0){
				exports.errMsg = "You've already add this comment";
				callback();
			}
			else{
				var musicdata = new musicInfo({
					email:infos.email,
					musicId:infos.musicId
				});
				musicdata.save(function(err1){
					if(err1){
						console.log(err1);
					}
					else{
						exports.errmsg = '';
						mdb.connect(function(){
							mdb.likeChange(1,infos.musicId,function(err2){
								if(err2)console.log(err2);
								else{
									mdb.disconnect();
									callback();
								}
							})
						})
					}
				})
			}
		}
	})
	musicdata.save(function(err3){
		if(err3){
			console.log('add error');
		}else{
			exports.errMsg = '';
			callback();
		}
	})
}
