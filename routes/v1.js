var express = require('express'),
	router = express.Router(),
<<<<<<< HEAD
	app = module.exports = express()


app.use('/', require('./index'))
app.use('/users', require('./users'))
app.use('/auth', require('./auth'))
=======
	app = module.exports = express(),
	index = require('./index'),
	users = require('./users'),
	auth = require('./auth');

// var passport = require('./passport');

app.use('/', index);
app.use('/users', users);

app.use('/auth', auth);
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
