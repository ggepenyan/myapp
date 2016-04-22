module.exports = function(sequelize, DataTypes) {
	var Users = sequelize.define('Users',{
		id:{
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		firstname:{
			type: DataTypes.TEXT
		},
		lastname:{
			type: DataTypes.TEXT
		},
		username:{
			type: DataTypes.STRING(50),
			unique: true
		},
		password:{
			type: DataTypes.STRING(20)
		},
		picture:{
			type: DataTypes.STRING(1000)
		},
		fbid:{
			type: DataTypes.STRING(50)
		}
	});
	
	return Users
}