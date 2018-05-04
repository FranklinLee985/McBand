// Here we want to stroe the event information to the database

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// We define the event schema as follows
var eventSchema = new Schema({
    uploader: String,
    eventname: String,
    venue: String,
    date: String,
    basicinfo: String,
    eventpicture: String 
});

var eventInfo = mongoose.model('EventDB', eventSchema);

// here we want to connect to database
exports.connect = function(callback){
    mongoose.connect('mongodb://localhost:27017/mcband', function(err){
        if(err){
            console.log('connect failed');
        }else{
            callback();
        }
    });
}


// disconnect the database
exports.disconnect = function(){
    mongoose.disconnect();
}


//search a specific event existed, if not existed then report the error
exports.search = function(eventsearch, callback){
    eventInfo.find({eventname: eventsearch.eventname}, function(err, docs){
        if(err){
            console.log('find error');
        }else{
            if(docs.length > 0){
                // Here is all the event information found according to the name
                callback();
            }else{
                exports.errMsg = 'No such event';
                callback();
            }
        }
    });
}


// add a new event to databse
exports.add = function(eventpara, callback) {
    var eventdata = new eventInfo({
        uploader: eventpara.username,
        eventname: eventpara.eventname,
        venue: eventpara.venue,
        date: eventpara.time,
        basicinfo: eventpara.eventinfo,
        eventpicture: eventpara.eventpicture
    });

    eventdata.save(function(err){
        if(err){
            console.log('add error');
        }else{
            exports.errMsg = '';
            callback();
        }
    })
}

// Here we would like to pass our event to front end
exports.passevent = function(infos, callback){
    var defaultValue = {
        uploader: 'None',
        eventname: 'None',
        venue: 'None',
        date: 'None',
        basicinfo: 'None',
        eventpicture: 'None'
    };
    eventInfo.find({}).exec(function(err,docs){
        if(err) console.log(err);
        else{
            console.log(docs.length);
            for(var i=0;i<docs.length;i++){
                if(docs[i] != null)infos[i] = docs[i];
                else infos[i] = defaultValue;
            }
            callback();
        }
    });
}

// here we get all the existing events
exports.getAll = function(callback){
    eventInfo.find({},function(err,docs){
        if(err) console.log(err);
        else{
            exports.eventList = docs;
            callback();
        }
    })
}

