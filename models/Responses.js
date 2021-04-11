module.exports = (sequelize, Sequelize) => {
	return sequelize.define('reponses', {
		game_id: {
			type: Sequelize.STRING,
			primaryKey: false,
		},
		user_id: {
			type: Sequelize.STRING,

		},
		round_number: {
			type: Sequelize.INTEGER,
		},
		question_id: {
			type: Sequelize.INTEGER,
		},
		winner: {
			type: Sequelize.BOOLEAN,
		},
		points: {
			type: Sequelize.INTEGER,
		},
		correct: {
			type: Sequelize.BOOLEAN,
		},
		q_time: {
			type: Sequelize.DATE,
		},
		a_time: {
			type: Sequelize.DATE,
		}

	}, {
		timestamps: false,
	});
};
