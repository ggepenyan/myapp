var express = require('express'),
	router = express.Router(),
	models = require('../models/');

/* GET users listing. */
router.get('/', function(req, res, next) {

	res.send("hello")
})

router.get('/', function(req, res, next) {
  res.send("hello")
})

router.get('/:user_id', function (req, res, next) {

	var user_id = parseInt(req.params.user_id, 10) || 0

	models.Users.findAll({
		where:{id: user_id}
	}).then(function (table) {

		if(table[0] != undefined)
			res.send(table)
		else
			res.send('Invalid user id')
	})
})

module.exports = router;
