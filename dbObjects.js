const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
		storage: 'database.sqlite',
});

const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Games = require('./models/Games')(sequelize, Sequelize.DataTypes);
const GamesPlayed = require('./models/GamesPlayed')(sequelize, Sequelize.DataTypes);

GamesPlayed.belongsTo(Games, { foreignKey: 'user_id', as: 'user' });

/* eslint-disable-next-line func-names */
Games.prototype.addItem = async function(user) {
		const gameUser = await GamesPlayed.findOne({
					where: { game_id: this.game_id, user_id: user.id },
				});

		if (gameUser) {
					//userItem.amount += 1;
					return true;//userItem.save();
				}

		return GamesPlayed.create({ game_id: this.game_id, user_id: user.id });
};

/* eslint-disable-next-line func-names */
Users.prototype.getGames = function() {
		return GamesPlayed.findAll({
					where: { user_id: this.user_id },
					//include: ['item'],
				});
};

module.exports = { Users, Games, GamesPlayed };
