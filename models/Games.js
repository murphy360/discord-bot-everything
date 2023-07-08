module.exports = (sequelize, Sequelize) => {
	return sequelize.define('games', {
		game_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		host_player_id: {
			type: Sequelize.STRING,
		},
		host_guild_id: {
			type: Sequelize.STRING,
		},
		game_start: {
			type: Sequelize.DATE,
		},
		game_end: {
			type: Sequelize.DATE,
		},
		game_end_type: {
			type: Sequelize.STRING,
		}
	}, {
		timestamps: false,
	});
};
