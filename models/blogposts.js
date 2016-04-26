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
		userid:{
			type: DataTypes.INTEGER
		},
		userimage:{
			type: DataTypes.STRING(1000)
		},
		content:{
			type: DataTypes.STRING(500)
		},
		password:{
			type: DataTypes.STRING(500)
		}
	})
	
	sequelize.sync()

	return Blogposts
}