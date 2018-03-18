var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var util = require('util');
var fs = require("fs");

var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(express.static(__dirname +'/front-end/McBand/'));
app.use(cookieParser());

app.get('/front-end/McBand/index.html',function(request, response){
    console.log("Cookies: " + util.inspect(request.cookies));
	response.sendFile(__dirname + "/front-end/McBand/" + 'index.html');
})

app.post('/register_process', urlencodedParser, function(req,res){
	var response = {
		"name":req.body.name,
		"email":req.body.email,
		"password":req.body.password
	};
	console.log(response);
	//res.end(JSON.stringify(response));
    let data = '';
    let readStream = fs.createReadStream("user_info.json");
    readStream.setEncoding('UTF8');
    var new_data = JSON.stringify(response);
    readStream.on('data', function(chunk) {
        data += chunk;
    });
    readStream.on('end', () => writeS(data));
    readStream.on('error', err => console.log(err.stack));
    //console.log(JSON.stringify(response));
    let writeS = dataS => {
        let writeStream = fs.createWriteStream('user_info.json');
        writeStream.write(dataS+new_data, 'UTF-8');
        writeStream.end();
        writeStream.on('finish', function(){
            console.log("finish writing");
        });
        writeStream.on('error', function(err){
            console.log(err.stack);
        });
        console.log("Sign up finished");
    }
    res.redirect(302,'.')
})

app.post('/login_process', urlencodedParser, function(req,res){
	var response = {
		"email":req.body.email,
		"password":req.body.password
	};
	console.log(response);
	//res.end(JSON.stringify(response));
    res.redirect(302,'.')
})

var server = app.listen(8888, function(){

	var host = server.address().address;
	var port = server.address().port;
	console.log("Testing: Address: http://" + host + ":" + port);
})
