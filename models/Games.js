module.exports = (sequelize, Sequelize) => {
	return sequelize.define('games', {
		game_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		creator_id: {
			type: Sequelize.STRING,
		},
		creator_name: {
			type: Sequelize.STRING,

		},
		game_start: {
			type: Sequelize.DATE,
		},
		game_end: {
			type: Sequelize.DATE,
		},
		winner_id: {
			type: Sequelize.STRING,
		}
	}, {
		timestamps: false,
	});
};
