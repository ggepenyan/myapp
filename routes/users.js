var express = require('express'),
	router = express.Router(),
	models = require('../models/');

/* GET users listing. */
router.get('/', function(req, res, next) {

	res.send("hello")
})

router.get('/:user_id', function (req, res, next) {
	var user_id = parseInt(req.params.user_id, 10) || 0
	if (user_id != 0) {
		
		return models.Users.findOne({
			where:{id: user_id}
		}).then(user => {
			return models.Blogposts.findAll({
				where:{userid: user_id}
			}).then(blogpost => {
				if(user != undefined) {

					res.render('user', {
						user: user,
						blogpost: blogpost,
						guest: true
					})
				}
				else
					res.send('Invalid user')
			})
		}).catch(error => {
			next(error)
		})
	} else {
		req.flash('error', 'uncorrect!')
		res.redirect('/')
	}
})

module.exports = router;
