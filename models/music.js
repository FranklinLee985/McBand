// Here we want to stroe the music name to the database

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var musicSchema = new Schema({
    uploader: String,
    musicname: String,
    musicPath: String,
    coverPath: String,
    sheetPath: String,
    likeCount: Number
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

exports.search = function(musicsearch, callback){
    musicInfo.find({musicname: musicsearch.musicname}, function(err, docs){
        if(err){
            console.log('find error');
        }else{
            if(docs.length > 0){
                // Here is all the music information found according to the name
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
        likeCount:0
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

exports.topTen = function(infos,callback){
    musicInfo.find({}).sort('-likeCount').exec(function(err,docs){
        if(err)console.log(err);
        else{
            for(var i = 0;i<10;i++){
                infos[i] = docs[i];
                
            }
        callback();
        }
    })
}
