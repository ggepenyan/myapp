var express = require('express'),
	router = express.Router(),
	models = require('../models'),
	util = require('util'),

	multiparty = require('multiparty'),
	path = require('path'),

	Promise = require("bluebird"),
	readFile = Promise.promisify(require("fs").readFile),
	writeFile = Promise.promisify(require("fs").writeFile),
	rename = Promise.promisify(require("fs").rename);

/* GET home page. */
router.get('/', function (req, res, next) {
	if(req.user) {
		return models.Users.findOne({
			where: {
				id: req.user.id
			}
		}).then(user => {
			return models.Blogposts.findAll({
				where:{
					userid: user.id
				}
			}).then(blogpost =>{
				return models.Comments.findAll({
					where: {
						password: null
					}
				}).then(comment => {

					res.render('user',  {
						user: user,
						blogpost: blogpost,
						comment: comment,
						isuser: true
					})
				})
			})
		}).catch(error => {
			next(error)
		})
	} else{
		res.render('index')
	}
})

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
						password: req.body.password,
						picture: "/images/profile.png"
					}).then(user => {
						res.redirect('/')
					})
				} else {
					req.flash('error', 'user with that username exists')
					res.redirect('/register')
				}
			}).catch(error => {
				next(error)
			})
		} else {
			req.flash('error', 'you must fill fields')
			res.redirect('/register')
		}
	}
})

router.post('/upload', function (req, res, next) {
	if (!req.user) {
		res.redirect('/')
	} else {
		var form = new multiparty.Form()
		
		form.parse(req, function (error, fields, files) {
			if (files.image) {
				if (files.image[0].originalFilename !== '' && files.image[0].size !== 0) {
					var image = files.image[0]
					var path_full = './public/images/' + image.originalFilename
					
					readFile(image.path).then(result => {
						
						return writeFile(path_full, result).then(error => {

							ext = path.extname(image.originalFilename)
							
							new_path = './public/images/' + Math.random() + '-' + req.user.username + ext

							path_for_db = new_path.slice(8, new_path.length)

							return rename(path_full, new_path).then(result => {
								return models.Users.update(
									{picture: path_for_db},
									{where: {
										id: req.user.id
									}
								}).then(user => {
									console.log(user)
									return models.Blogposts.update(
										{userimage: path_for_db},
										{where: {
											username: req.user.username
										}
									}).then(blog_user =>{
										console.log("upload success")
										res.redirect('/')
									})
								})
							})
						})
					}).catch(error => {
						next(error)
					})
				} else {
					req.flash('error', 'not correct')
					res.redirect('/change')
				}
			} else {
				req.flash('error', 'you must fill field')
				res.redirect('/change')
			}
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

		if (req.body.firstname && req.body.lastname) {
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
					next(error)
				})
			}
		} else {
			req.flash('error', 'you must fill fields')
			res.redirect('/change')
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
			return models.Comments.findAll({
				where:{
					password: null
				}
			}).then(comment => {
				res.render("blogposts",{
					blogpost: blogpost,
					comment: comment,
					user: req.user
				})
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
		if(req.body.text) {
			if (req.body.text !== '') {
				return models.Users.findOne({
					where: {
						id: req.user.id
					}
				}).then(user => {
					return models.Blogposts.create({
						firstname: user.firstname,
						lastname: user.lastname,
						username: user.username,
						userimage: user.picture,
						userid: user.id,
						content: req.body.text

					}).then(blogpost => {
						req.flash('info', 'blogpost added successfully')
						res.redirect("blogpost")					
					})
				}).catch(error => {
					next(error)
				})
			} else {
				req.flash('error', 'you must enter text')
				res.redirect('/blogpost')
			}
		}
		else {
			req.flash('error', 'you must enter text')
			res.redirect('/blogpost')
		}
	} 
})

router.post('/comment', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
	} else {

		if(req.body.comment_cont) {
			if (req.body.comment_cont !== '') {
				return models.Users.findOne({
					where:{
						id: req.user.id
					}
				}).then(user => {
					return models.Comments.create({
						blogpostid: req.body.blog_id,
						userid: user.id,
						firstname: user.firstname,
						lastname: user.lastname,
						userimage: user.picture,
						content: req.body.comment_cont
					}).then(comment => {
						res.redirect('/blogpost')
					})
				}).catch(error => {
					next(error)
				})
			} else {
				req.flash('error', 'you must enter comment')
				res.redirect('/blogpost')
			}
		} else{
			req.flash('error', 'you must enter comment')
			res.redirect('/blogpost')
		}
	}
})

router.post('/blogpost_remove', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		res.redirect('/')
	} else {
		return models.Blogposts.destroy({
			where: {
				id: req.body.blog_id,
				userid: req.user.id
			}
		}).then(post =>{
			return models.Comments.destroy({
				where: {
					blogpostid: req.body.blog_id,
					// userid: req.user.id
				}
			}).then(comment => {
				
				req.flash('info', 'blogpost removed')
				res.redirect('/blogpost')
			})
		}).catch(error =>{
			next(error)
		})
	}
})

module.exports = router