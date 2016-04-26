module.exports = function(sequelize, DataTypes) {
	var Comments = sequelize.define('Comments',{
		blogpostid:{
			type: DataTypes.INTEGER
		},
		userid:{
			type: DataTypes.INTEGER
		},
		firstname:{
			type: DataTypes.TEXT
		},
		lastname:{
			type: DataTypes.TEXT
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

	return Comments
}