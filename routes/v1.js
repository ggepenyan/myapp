var express = require('express'),
	router = express.Router(),
	app = module.exports = express(),
	index = require('./index'),
	users = require('./users'),
	auth = require('./auth');

// var passport = require('./passport');

app.use('/', index);
app.use('/users', users);

app.use('/auth', auth);