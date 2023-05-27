module.exports = (sequelize, Sequelize) => {
	return sequelize.define('answers', {
		answer_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: Sequelize.TEXT
		},
		question_id: {
			type: Sequelize.TEXT
		},
		guild_id: {
			type: Sequelize.TEXT
		},
		global_winner: {
			type: Sequelize.BOOLEAN
		},
		guild_winner: {
			type: Sequelize.BOOLEAN
		},
		points: {
			type: Sequelize.INTEGER
		},
		answer_date: {
			type: Sequelize.DATE
		},
	});
};
