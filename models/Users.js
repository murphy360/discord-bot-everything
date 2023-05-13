module.exports = (sequelize, Sequelize) => {
	return sequelize.define('users', {
		user_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		user_name: {
			type: Sequelize.STRING,

		},
		trivia_points_total: {
			type: Sequelize.INTEGER,
		},
		total_xp: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
	});
};