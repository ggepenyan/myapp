"use strict";

var fs = require("fs"),
	path = require("path"),
	Sequelize = require("sequelize"),
	env = process.env.NODE_ENV || "development",
	config = require(__dirname + '/../config/config.json')[env],
	
	sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
		host:config.mysql.host,
		port:config.mysql.port,
		dialect:"mysql",

		pool:{
			max:3,
			min:0,
			idle:10000
		},
		logging:false
	}),

	redis = require("redis"),
	db = {};

fs.readdirSync(__dirname).filter(function (file) {
	// console.log((file.indexOf(".") !== 0) && (file !== "index.js"));
<<<<<<< HEAD
	return (file.indexOf(".") !== 0) && (file !== "index.js")
}).forEach(function (file) {
	var model = sequelize["import"](path.join(__dirname, file))
	 // console.log(model.name);
	db[model.name] = model
=======
	return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function (file) {
	var model = sequelize["import"](path.join(__dirname, file));
	 // console.log(model.name);
	db[model.name] = model;
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
});

Object.keys(db).forEach(function (modelName) {
	// console.log(modelName);
	if ("associate" in db[modelName]) {
<<<<<<< HEAD
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize
db.redis = redis

module.exports = db
=======
		db[modelName].associate(db);
	}
});

// db.Users.create({
// 	firstname:"asd",
// 	lastname:"asd",
// 	username:"asd",
// 	password:"asd"
// });
//console.log(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.redis = redis;

module.exports = db;
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
