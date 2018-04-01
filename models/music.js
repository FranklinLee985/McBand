var mongoose = require('mongoose');
var schema = mongoose.Schema;

var musicSchema = new Schema({
    musicname: String,
    musicpic: Schema.Types.Mixed,
    musicsheet: Schema.Types.Mixed,
    music: Schema.Types.Mixed
});

var musicInfo = mongoose.model('MusicDB', musicSchema);

exports.connect = function(callback){
    mongoose.connect('mongodb://localhost:27017//mcband', function(err){
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

