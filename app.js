var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon'); //页面图标
var bodyParser = require('body-parser'); //处理请求body的中间件
var session = require('express-session');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var musicRouter = require('./routes/music_index');

var app = express();

// view engine setup
var ejs = require('ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'mcband.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); //解析 application/x-www-form-urlencoded类型
app.use(bodyParser.json()); //解析 application/json类型



app.use(express.static(path.join(__dirname, 'public')));



app.use(cookieParser());

app.use(session({
  secret: 'loginSession',
  cookie: { maxAge: 30 * 60 * 1000 },
  resave: false,
  saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', musicRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
