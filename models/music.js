// Here we want to stroe the music name to the database

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

exports.likeChange = function(para,mid,callback){
	musicInfo.find({musicId:mid},function(err,docs){
		if(err) console.log(err);
		else{
			var count = docs[0].likeCount + para;
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

exports.topTen = function(infos,callback){
	var defaultValue = {
		uploader: 'None',
		musicname: 'None',
		coverPath: '/resources/upload/music/default.png',
		likeCount: 0,
		musicId:''
	}
	musicInfo.find({}).sort('-likeCount').exec(function(err,docs){
		if(err)console.log(err);
		else{
			for(var i = 0;i<10;i++){
				if(docs[i] != null)infos[i] = docs[i];
				else infos[i] = defaultValue;

			}
		    callback();
		}
	})
}


