var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require(__dirname + '/route/admin');
var userRouter = require(__dirname + '/route/user');
var hbs = require('express-handlebars')
var fileUpload = require('express-fileupload');
const db = require(__dirname + '/model/dbConnection/connection.js')

// console.log(__dirname)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:(__dirname+'/views/layout/'),partialsDir:(__dirname+'/views/partials/'),helpers: {
  inc: function (value, options) {
      return parseInt(value) + 1;
    }
}}));

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(function(req, res, next) { 
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');//to clear cache, to avoid going to cached login page after hitting back button after logging in.
  next(); 
});
db.connect((err)=>{
  if(err) {
    console.log('Connection Error! '+ err);
  } else {
    console.log('Database connected successfully to mongoDB atlas.')
  }
});


app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  if(err.status == 404){
    res.status(404).render('404-error');

  } else if(err.status == 403){
    res.status(403).render('access-denied');

  } else {
    res.render('error');
  }

});


module.exports = app;
