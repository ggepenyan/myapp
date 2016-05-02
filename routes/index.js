var express = require('express'),
	router = express.Router(),
	models = require('../models'),
	util = require('util'),

	multiparty = require('multiparty'),
	path = require('path'),

	Entities = require('html-entities').AllHtmlEntities,
	
	entities = new Entities(),

	Promise = require("bluebird"),
	readFile = Promise.promisify(require("fs").readFile),
	writeFile = Promise.promisify(require("fs").writeFile),
	rename = Promise.promisify(require("fs").rename),
	
	request = require('request-promise'),
	cheerio = require('cheerio');

/* GET home page.*/
router.get('/', function (req, res, next) {
	if(!req.user) {
		return res.render('index')
	}
	
	return models.Users.findOne({
		where: {
			id: req.user.id
		}
	}).then(user => {
		return models.Blogposts.findAll({
			where:{
				userid: user.id
			}
		}).then(blogpost => {
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
})

router.get('/register', function(req, res, next) {
	if (req.user) {
		req.flash('error', 'log out please')
		return res.redirect('/')
	} else{
		res.render('register')
	}
})

router.post("/register", function (req, res, next) {
	if (req.user) {
		req.flash('error', 'log out please')
		return res.redirect('/')
	}

	if (!req.body.firstname && !req.body.lastname && !req.body.username && !req.body.password) {
		req.flash('error', 'you must fill fields')
		return res.redirect('/register')
	}

	if (req.body.firstname == '' || req.body.lastname == '' || req.body.username == '' || req.body.password == '') {
		req.flash('error', 'you must fill fields')
		return res.redirect('/register')
	} 

	return models.Users.findOne({
		where:{
			username: req.body.username
		}
	}).then(user => {
		if (user !== null) {
			req.flash('error', 'user with that username exists')
			return res.redirect('/register')
		}
		return models.Users.create({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			username: req.body.username,
			password: req.body.password,
			picture: "/images/profile.png"
		})

	}).then(user => {
		res.redirect('/')
	}).catch(error => {
		next(error)
	})
})

router.post('/upload', function (req, res, next) {
	if (!req.user) {
		return res.redirect('/')
	}
	var form = new multiparty.Form()
		
	form.parse(req, function (error, fields, files) {
		if (!files.image) {
			req.flash('error', 'not correct')
			return res.redirect('/change')
		}
		if (files.image[0].originalFilename === '' && files.image[0].size == 0) {
			
			req.flash('error', 'you must fill field')
			return res.redirect('/change')
		}
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
	})
})

router.get('/login', function(req, res, next) {
	if (req.user) {
		req.flash('error', 'please logout at first')
		return res.redirect('/')
	}
	res.render('login')
})

router.get('/change', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		return res.redirect('/login')
	}
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
})

router.post('/change', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		return res.redirect('/login')
	}
	var user_dates = {
		firstname:req.body.firstname,
		lastname:req.body.lastname
	}

	if (!user_dates.firstname && !user_dates.lastname) {
		req.flash('error', 'you must fill fields')
		return res.redirect('/change')	
	}
	if (user_dates.firstname == '' || user_dates.lastname == '') {

		req.flash('error', 'you must fill fields')
		return res.redirect('/change')
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
				res.redirect("/")
			})
		}).catch(error => {
			console.log(error)
			next(error)
		})
	}
})

router.get('/authors/:user_id', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'login please')
		return res.redirect('/')
	}
	var user_id = parseInt(req.params.user_id, 10) || 0
	
	if (user_id == 0) {
		req.flash('error', 'uncorrect!')
		res.redirect('/')
	}
	return models.Users.findOne({
		where:{id: user_id}
	}).then(user => {

		if (user.id == req.user.id) {
			return res.redirect('/')
		}

		return models.Blogposts.findAll({
			where:{userid: user_id}
		}).then(blogpost => {
			res.render('user', {
				user: user,
				blogpost: blogpost,
				guest: true
			})
		})

	}).catch(error => {
		next(error)
	})
})

router.get('/blogpost', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		return res.redirect('/')
	}

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

			var url_arr = blogpost.map(function (post) {
				var str = post.content.search('<a href')
				
				if (str == -1) {
					return
				}
				var link_start = str + 9
				var link_end = post.content.search('" target')
				var link = post.content.substring(link_start, link_end)
				return link
			})
			console.log(url_arr)
			var urls = url_arr.filter(function (elem) {
				return typeof elem === 'string'
			})
			var grabber = function (url) {
				var ogs = []
				var options = {
					uri: url,
					transform: function (body) {
						return cheerio.load(body)
					}
				}
				return request(options).then($ => {
					for (var i = $('head meta[property^=og]').length - 1; i >= 0; i--) {
						var elem = i + ''
						var meta_attribs = $('head meta[property^=og]')[elem].attribs
						ogs.push([meta_attribs.property, meta_attribs.content])
					}
					return ogs
				})
			}

			Promise.map(urls, grabber).then(result => {
				console.log(result)
				res.render("blogposts",{
					blogpost: blogpost,
					comment: comment,
					meta_dates: result,
					user: req.user
				})
			})			
		})

	}).catch(error => {
		next(error)
	})
})

router.post('/blogpost', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		return res.redirect('/')
	}
	
	if(!req.body.text) {
		req.flash('error', 'you must enter text')
		return res.redirect('/blogpost')
	}
	if (req.body.text == '') {
		req.flash('error', 'you must enter text')
		return res.redirect('/blogpost')
	}

	var content = req.body.text
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
	content = content.replace(exp,"<a href=\"$1\" target=\"_blank\">visit page</a>")

	return models.Users.findOne({
		where: {
			id: req.user.id
		}
	}).then(user => {
		console.log(content)
		return models.Blogposts.create({
			firstname: user.firstname,
			lastname: user.lastname,
			username: user.username,
			userimage: user.picture,
			userid: user.id,
			content: content

		}).then(blogpost => {
			req.flash('info', 'blogpost added successfully')
			res.redirect("/blogpost")					
		})
	}).catch(error => {
		next(error)
	})
})

router.post('/comment', function (req, res, next) {
	if (!req.user) {
		return req.flash('error', 'please login at first')
	}

	if(!req.body.comment_cont) {
		req.flash('error', 'you must enter comment')
		return res.redirect('/blogpost')
	}
	
	if (req.body.comment_cont == '') {
		req.flash('error', 'you must enter comment')
		return res.redirect('/blogpost')
	}
	
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
})

router.post('/blogpost_remove', function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'please login at first')
		return res.redirect('/')
	}
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
})

module.exports = router