var express = require('express');
var router = express.Router();
var models = require('../models');
var util = require('util')
/* GET home page. */
router.get('/', function (req, res) {
	console.log(req.user);
	if(req.user) {
		res.render('index',  {
			user: req.user
		})
	}else{
		res.render('index')
	}
});

router.get('/register', function(req, res, next) {
	if (req.user) {
		res.redirect('/')
	}
  res.render('register');
});

router.post("/register", function (req, res) {

	return models.Users.findOrCreate({
		where:{
			firstname:req.body.firstname,
			lastname:req.body.lastname,
			username:req.body.username,
			password:req.body.password,
			new_user: "true"
		}
	}).then(function (user) {
		res.render("register_success");
	}).catch(function (error) {
		console.log(error);
	});
});

router.get('/login', function(req, res, next) {
	if (req.user) {
		res.redirect('/')
	}

	var messages = req.flash('error')
	var message = messages.length > 0 ? messages[0] : ''
	
	console.log('message: ', message);
	
	res.render('login', {
		message: message
	});
});

router.get('/change', function (req, res, next) {
	if (!req.user) {
		return res.redirect('/login');
	}

	return models.Users.findOne({
		where:{
			id: req.user.id
		}
	}).then(function (user) {
		user.update({
			new_user: "false"
		});
		res.render('change', {
			user: user
		});
	}).catch(function (error) {
		console.log(error);
		next(error);
	})
})

router.post('/change', function (req, res) {
	if (!req.user) {
		return res.redirect('/login');
	}

	return models.Users.findOne({
		where: {
			id: req.user.id
		}
	}).then(function (user) {
		user.update({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			username: req.body.username
		});
		res.redirect("/");

	}).catch(function (error) {
		console.log(error);
		next(error);
	});
})

router.get('/blogpost', function (req, res) {
	if (!req.user) {
		res.redirect('/');
	}

	return models.Blogposts.findAll({
		where:{
			password: null
		}
	}).then(function (blogpost) {
		res.render("blogposts",{
			blogpost: blogpost
		})
	}).catch(function (error) {
		console.log(error);
	});
})

router.post('/blogpost', function (req, res) {
	if (req.user) {
		res.redirect('/')
	}

	return models.Blogposts.create({
		firstname: req.user.firstname,
		lastname: req.user.lastname,
		username: req.user.username,
		content: req.body.text

	}).then(function (blogpost) {
		res.redirect("blogpost")

	}).catch(function (error) {
		console.log(error);
	});
})

module.exports = router;
