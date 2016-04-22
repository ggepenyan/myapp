module.exports = function(sequelize, DataTypes) {
	var Blogposts = sequelize.define('Blogposts',{
		firstname:{
			type: DataTypes.TEXT
		},
		lastname:{
			type: DataTypes.TEXT
		},
		username:{
			type: DataTypes.STRING(50)
		},
<<<<<<< HEAD
		userid:{
			type: DataTypes.INTEGER
		},
=======
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
		content:{
			type: DataTypes.STRING(500)
		},
		password:{
			type: DataTypes.STRING(500)
		}
<<<<<<< HEAD
	})

	sequelize.sync()

	return Blogposts
=======
	});
	sequelize.sync();
	return Blogposts;
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
}