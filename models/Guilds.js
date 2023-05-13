module.exports = (sequelize, Sequelize) => {
	return sequelize.define('guilds', {
		guild_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		guild_name: {
			type: Sequelize.STRING,
		},
		trivia_points_total: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
		total_xp: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
	});
};
