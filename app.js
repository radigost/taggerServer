const express = require('express');
const path = require('path');

const fs = require('fs');
const  dotenv = require('dotenv');
if (fs.existsSync('.env')) dotenv.load();

// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



const index = require('./routes/index');
const files = require('./routes/files');
app.use('/files',express.static(path.join(__dirname, `files/${user.path}/`)));

app.use('/', index);

const images = require('./routes/images');
app.use('/api/images', images);

const translate = require('./routes/translate');
app.use('/api/translate', translate);

const stocks = require('./routes/stocks');
app.use('/api/stocks/shutterstock', stocks);
app.use('/api/files', files);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
next(err);
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
