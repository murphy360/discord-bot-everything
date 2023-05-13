const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
		storage: './data/database.sqlite',
});

const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Games = require('./models/Games')(sequelize, Sequelize.DataTypes);
const GamesPlayed = require('./models/GamesPlayed')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds')(sequelize, Sequelize.DataTypes);
const Questions = require('./models/Questions')(sequelize, Sequelize.DataTypes);

GamesPlayed.belongsTo(Games, { foreignKey: 'game_id', as: 'game' });

Reflect.defineProperty(Users.prototype, 'addGame', {
	value: async game => {
		const gamePlayed = await GamesPlayed.findOne({
			where: { user_id: this.user_id, game_id: game.game_id },
		});

		if (gamePlayed) {
			
			return gamePlayed.save();
		}

		return GamesPlayed.create({ user_id: this.user_id, game_id: game.game_id, is_guild_winner: 0, is_global_winner: 0 });
	},
});

module.exports = { Users, Games, Questions, GamesPlayed, Guilds};
