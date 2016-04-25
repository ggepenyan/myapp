var express = require('express'),
	router = express.Router(),
	models = require('../models/');

/* GET users listing. */
router.get('/', function(req, res, next) {

	res.send("hello")
})

router.get('/:user_id', function (req, res, next) {
	if (req.user) {

		var user_id = parseInt(req.params.user_id, 10) || 0
		if (user_id != 0) {

			return models.Users.findOne({
				where:{id: user_id}
			}).then(user => {
				if(user != undefined) {
					if (user.id == req.user.id) {
						return res.redirect('/')
					} else {
						return models.Blogposts.findAll({
							where:{userid: user_id}
						}).then(blogpost => {
							res.render('user', {
								user: user,
								blogpost: blogpost,
								guest: true
							})
						})
					}
				} else {
					req.flash('error', 'Invalid user')
					res.redirect('/')
				}
			}).catch(error => {
				next(error)
			})
		} else {
			req.flash('error', 'uncorrect!')
			res.redirect('/')
		}
	} else {
		req.flash('error', 'login please')
		res.redirect('/')
	}
})

module.exports = router;
