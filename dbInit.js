const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
		storage: 'database.sqlite',
});

const Games = require('./models/Games')(sequelize, Sequelize.DataTypes);
require('./models/Users')(sequelize, Sequelize.DataTypes);
require('./models/GamesPlayed')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
		const game = [
					Games.upsert({ game_id: '0' }),
				];
		await Promise.all(game);
		console.log('Database synced');
		sequelize.close();
}).catch(console.error);
