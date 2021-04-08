module.exports = (sequelize, DataTypes) => {
 	return sequelize.define('games', {
		game_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
	}, {
		timestamps: false,
	});
};
