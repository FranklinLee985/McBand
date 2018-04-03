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
				mdb.likeChange(-1,infos.musicId,function(err){
					if(err)console.log(err);
					else{
						mdb.disconnect();
						callback();
					}
				})
			});
		}
	})
};

exports.showAll = function(userEmail,result,callback){
	collectInfo.find({email:userEmail},function(err,docs){
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
				exports.errMsg = "You've already like this music!";
				callback();
			}
			else{
				var collectdata = new collectInfo({
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
