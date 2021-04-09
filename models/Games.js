module.exports = (sequelize, Sequelize) => {
	return sequelize.define('games', {
		game_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
	}, {
		timestamps: false,
	});
};
