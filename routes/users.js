<<<<<<< HEAD
var express = require('express')
var router = express.Router()
var models = require('../models/')

/* GET users listing. */
router.get('/', function(req, res, next) {

	res.send("hello")
})

router.get('/', function(req, res, next) {
  res.send("hello")
})

router.get('/:user_id', function (req, res, next) {

	var user_id = parseInt(req.params.user_id, 10) || 0
=======
var express = require('express');
var router = express.Router();
var models = require('../models/');

// console.log(models.us);
/* GET users listing. */
router.get('/', function(req, res, next) {

	res.send("hello");
});
// console.log(models.Users);
router.get('/', function(req, res, next) {
  res.send("hello");
});

router.get('/:user_id', function (req, res, next) {

	var user_id = parseInt(req.params.user_id, 10) || 0;
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676

	models.Users.findAll({
		where:{id: user_id}
	}).then(function (table) {
<<<<<<< HEAD

		if(table[0] != undefined)
			res.send(table)
		else
			res.send('Invalid user id')
	})
})

module.exports = router
=======
		//console.log(table[0]==undefined);
		if(table[0] != undefined)
			res.send(table);
		else
			res.send('Invalid user id');
	});
	// if (user_id !== 0) {
	// 	res.send('user info for user: ' + user_id);
	// }
	// else{
	// 	res.send('Invalid user id,');
	// }
});

module.exports = router;
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
