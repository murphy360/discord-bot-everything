module.exports = (sequelize, DataTypes) => {
	return sequelize.define('games_played', {
		user_id: DataTypes.STRING,
		game_id: DataTypes.STRING,
		is_guild_winner: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			'default': 0,
		},
		is_global_winner: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			'default': 0,
		},
	}, {
		timestamps: false,
	});
};
