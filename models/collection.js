// here we require the module and use mongoose to manage our database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mdb = require('./music');

// here we define the schema for collection 
var collectionSchema = new Schema({
	email: String,
	musicId: String,
	musicname:String,
	coverPath:String
});

var collectInfo = mongoose.model('collectionDB',collectionSchema);

// here we would like connect to database
exports.connect = function(callback){
	mongoose.connect('mongodb://localhost:27017/mcband', function(err){
		if(err){
			console.log('connect failed');
		}else{
			callback();
		}
	});
};

// here we would like to disconnect the connected database
exports.disconnect = function(){
	mongoose.disconnect();
};

// here we would like to delete the like-relation between a user
// and a piece of music, this will further facilitate the ranking
// system
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
				});
			});
		}
	});
};


// here we pass all the collection information to front end
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
};


// here we add a new collection
// report error if the music has already been liked
exports.add = function(infos, callback) {
	var musicInfo = [];
	mdb.search(infos.musicId, musicInfo,function(){
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
						musicId:infos.musicId,
						musicname:musicInfo[0].musicname,
						coverPath:musicInfo[0].coverPath
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
								});
							});
						}
					});
				}
			}
		});
	})

};

// here we would like to find a certain collection by inputing the
// user email address and the music id
exports.isLiked = function(infos,callback){
	collectInfo.find({email:infos.email,musicId:infos.musicId},function(err,docs){
		if(err)console.log(err);
		else{
			if(docs.length > 0){
				exports.liked = true;
				callback();
			}
			else{
				exports.liked = false;
				callback();
			}
		}
	});
};
