var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mdb = require('./music');

var collectionSchema = new Schema({
	email: String,
	musicId: String
});

var collectInfo = mongoose.model('collectionDB',collectionSchema);

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
	collectInfo.remove({email:infos.email,musicId:infos.musicId},function(err){
		if(err){
			console.log("No such collection record!");
		}
		else{
			console.log("Remove success!");
			exports.errmsg = '';
			mdb.connect(function(){
				mdb.likeChange(-1,infos.musicId,function(){
					mdb.disconnect();
					callback();
				})
			});
		}
	})
};


exports.showAll = function(userName,result,callback){
	collectInfo.find({username:userName},function(err,docs){
		if(err)console.log(err);
		else{
			docs.forEach(function(doc){
				console.log(doc);
				result.push(doc);
			});
			callback();
		}
	});
}

exports.add = function(infos, callback) {
	
	collectInfo.find({email:infos.email,musicId:infos.musicId},function(err,docs){
		if(err)console.log(err);
		else{
			if(docs.length > 0){
				exports.errMsg = "You've already liked this music!";
				callback();
			}
			else{
				var collectdata = new collectInfo({
					email:infos.email,
					musicId:infos.musicId
				});
				collectdata.save(function(err1){
					if(err1){
						console.log(err1);
					}
					else{
						exports.errmsg = '';
						mdb.connect(function(){
							mdb.likeChange(1,infos.musicId,function(){
								mdb.disconnect();
								callback();
							})
						})
					}
				})
			}
		}
	})
}

exports.isLiked = function(infos,callback){
	collectInfo.find({email:infos.email,musicId:infos.musicId},function(err,docs){
		if(err)console.log(err);
		else{
			if(docs.length > 0){
				exports.like = true;
				callback();
			}
			else{
				exports.liked = false;
				callback();
			}
		}
	})
}
