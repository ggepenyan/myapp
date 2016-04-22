var express = require('express')
var router = express.Router()
var models = require('../models')
var util = require('util')

var multiparty = require('multiparty')
var path = require('path')

var Promise = require("bluebird")
var readFile = Promise.promisify(require("fs").readFile)
var writeFile = Promise.promisify(require("fs").writeFile)
var rename = Promise.promisify(require("fs").rename)

/* GET home page. */
router.get('/', function (req, res, next) {
	// console.log('req.ip' + req.ip)
	if(req.user) {
		return models.Users.findOne({
			where: {
				id: req.user.id
			}
		}).then(user => {
			res.render('index',  {
				user: user
			})
		}).catch(error => {
			next(error)
		})
	} else{
		res.render('index')
	}
});

router.get('/register', function(req, res, next) {
	if (req.user) {
		req.flash('error', 'log out please')
		res.redirect('/')
	} else{
		res.render('register')
	}
})

router.post("/register", function (req, res, next) {
	if (req.user) {
		req.flash('error', 'log out please')
		res.redirect('/')
	} else {
		
		if (req.body.firstname == '' || req.body.lastname == '' || req.body.username == '' || req.body.password == '') {
			req.flash('error', 'you must fill fields')
			res.redirect('/register')

		} else if (req.body.firstname && req.body.lastname && req.body.username && req.body.password) {

			return models.Users.findOne({
				where:{
					username: req.body.username
				}
			}).then(user => {
				if (user == null) {

					return models.Users.create({
						firstname: req.body.firstname,
						lastname: req.body.lastname,
						username: req.body.username,
						password: req.body.password
					}).then(user => {
						res.redirect('/')
					})
				} else {
					req.flash('error', 'user with that username exists')
					res.redirect('/register')
				}
			}).catch(error => {
				next(error)
			});
		} else {
			req.flash('error', 'you must fill fields')
			res.redirect('/register')
		}
	}
});

router.post('/upload', function (req, res, next) {
	if (!req.user) {
		res.redirect('/')
	} else {
		var form = new multiparty.Form();
		
		form.parse(req, function (error, fields, files) {
			var image = files.image[0]
			var path_full = './public/images/' + image.originalFilename
			
			readFile(image.path).then(result => {
				
				return writeFile(path_full, result).then(error => {

					ext = path.extname(image.originalFilename)
					
					new_path = './public/images/' + Math.random() + '-' + req.user.username + ext

					return rename(path_full, new_path).then(result => {
						return models.Users.update(
							{picture: new_path},
							{where: {
								id: req.user.id
							}
						}).then(result => {
							res.redirect('/')
						})
					})
				})
			}).catch(error => {
				next(error)
			})
		})
	}
})

router.get('/login', function(req, res, next) {
	if (req.user) {
		req.flash('error', 'please logout at first')
		res.redirect('/')
	}else {
		res.render('login')
	}
})

router.get('/change', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/login')
	} else {
		return models.Users.findOne({
			where:{
				id: req.user.id
			}
		}).then(user => {
			res.render('change', {
				user: user
			})
		
		}).catch(error => {
			next(error)
		})
	}
})

router.post('/change', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/login')
	} else {
		var user_dates = {
			firstname:req.body.firstname,
			lastname:req.body.lastname
		}

		if (user_dates.firstname == '' || user_dates.lastname == '') {
			
			req.flash('error', 'you must fill fields')
			res.redirect('/change')
		} else {
			return models.Users.findOne({
				where: {
					id: req.user.id
				}
			}).then(user => {
				return models.Blogposts.findAll({
					where: {
						userid: user.id
					}
				}).then(blog_user =>{
					user.update({
						firstname: user_dates.firstname || req.user.firstname,
						lastname: user_dates.lastname || req.user.lastname
					})

					blog_user.map(function (serial_user) {
						serial_user.update({
							firstname: user_dates.firstname || req.user.firstname,
							lastname: user_dates.lastname || req.user.lastname
						})
					})
					req.flash('info', 'account dates are updated')
					res.redirect("/")
				})

			}).catch(error => {
				console.log(error)
				next(error);
			})
		}
	}
})

router.get('/blogpost', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/')
	}else {
		return models.Blogposts.findAll({
			where:{
				password: null
			}
		}).then(blogpost => {
				res.render("blogposts",{
					blogpost: blogpost,
					user: req.user
				})
		
		}).catch(error => {
			next(error)
		})
	}
})

router.post('/blogpost', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/')
	}else {
		return models.Blogposts.create({
			firstname: req.user.firstname,
			lastname: req.user.lastname,
			username: req.user.username,
			userid: req.user.id,
			content: req.body.text

		}).then(blogpost => {
			req.flash('info', 'blogpost added successfully')
			res.redirect("blogpost")

		}).catch(error => {
			next(error)
		})
	}
})

router.post('/blogpost_remove', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/')
	}else {
		return models.Blogposts.destroy({
			where: {
				id: req.body.blog_id,
				user_id: req.user.id
			}
		}).then(post =>{
			req.flash('info', 'blogpost removed')
			res.redirect('/blogpost')
		}).catch(error =>{
			next(error)
		})
	}
})

module.exports = router
