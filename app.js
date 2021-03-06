var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    flash = require('express-flash');

// var v1 = require('./routes/v1');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(flash())
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  cookie: { secure: false },
  secret: 'sdlkjsdkljsdklfj2342kl34o23i4',
  resave: true,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


app.use('/', require('./routes/v1'));

console.log(' * * * STARTING * * * \n\n')


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.stack)
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// <<<<<<< HEAD
// =======
// app.use('/', require('./routes/index'));
// >>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676

module.exports = app;
