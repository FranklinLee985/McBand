// Here we want to stroe the music name to the database
// we require the module and use mongoose to manage our database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// here we define the schema of each music
var musicSchema = new Schema({
	uploader: String,
	musicname: String,
	musicPath: String,
	coverPath: String,
	sheetPath: String,
	likeCount: Number,
	musicId:String
});

var musicInfo = mongoose.model('MusicDB', musicSchema);


// here we connect to database
exports.connect = function(callback){
	mongoose.connect('mongodb://localhost:27017/mcband', function(err){
		if(err){
			console.log('connect failed');
		}else{
			callback();
		}
	});
}

// here we disconnect the database
exports.disconnect = function(){
	mongoose.disconnect();
}

// here we would like to search a certain piece of music 
// and return the search informaiont back to front end
//report error if the music has not been found
exports.search = function(mid,result,callback){
	musicInfo.find({musicId: mid}, function(err, docs){
		if(err){
			console.log('find error');
		}else{
			if(docs.length > 0){
				result.push(docs[0]);
				callback();
			}else{
				exports.errMsg = 'No such music';
				callback();
			}
		}
	});
}


// here we add a new music to our database
// if the uploaded information is not complete, then report the
// add error
exports.add = function(musicpara, callback) {
	var musicdata = new musicInfo({
		uploader:musicpara.username,
		musicname:musicpara.musicname,
		musicPath:musicpara.musicPath,
		coverPath:musicpara.coverPath,
		sheetPath:musicpara.sheetPath,
		likeCount:0,
		musicId:new Date().getTime()+'_'+musicpara.username+'_'+musicpara.musicname
	});
	musicdata.save(function(err){
		if(err){
			console.log('add error');
		}else{
			exports.errMsg = '';
			callback();
		}
	})
}

// if the a user dislike a music then we change the like count 
// for each music, this will also give information for ranking 
// system
exports.likeChange = function(para,mid,callback){
	musicInfo.find({musicId:mid},function(err,docs){
		if(err) console.log(err);
		else{
			console.log("para" + para + "docs[0]" + docs[0]);
			var count;
			count = docs[0].likeCount + para;
			musicInfo.update({musicId:mid},{likeCount:count},{multi:false},function(err,rec){
				if(err) console.log(err);
				else{
					console.log("update success! "+rec);
					callback();
				}
			})
		}

	})
}

// here we get all the music from the database and return it to 
// front end. this will further give information to view all music
// part
exports.getAll = function(callback){
	musicInfo.find({},function(err,docs){
		if(err)console.log(err);
		else{
			//console.log("docs:" + docs);
			exports.musicList = docs;
			callback();
		}
	})
}

// here we get the top ten music by selecting the music considering
//their like count number
exports.topTen = function(infos,callback){
	var defaultValue = {
		uploader: 'None',
		musicname: 'None',
		coverPath: '/resources/upload/music/default.png',
		likeCount: 0,
		musicId:''
	};
	musicInfo.find({}).sort('-likeCount').exec(function(err,docs){
		if(err)console.log(err);
		else{
			for(var i = 0;i<10;i++){
				if(docs[i] != null)infos[i] = docs[i];
				else {
					infos[i] = defaultValue;
				}

			}
		    callback();
		}
	});
}


