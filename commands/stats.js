const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});
const Games = require('./../models/Games')(sequelize, Sequelize.DataTypes);
const Users = require('./../models/Users')(sequelize, Sequelize.DataTypes);
const Servers = require('./../models/Servers')(sequelize, Sequelize.DataTypes);
const Responses = require('./../models/Responses')(sequelize, Sequelize.DataTypes);
const Questions = require('./../models/Questions')(sequelize, Sequelize.DataTypes);


module.exports = {
	name: 'stats',
	description: 'print bot stats',
	async execute(message, args) {
	   			/***** Report Stats: Write an embed message with applicable stats *****/
	
		const gamesList = await Games.count().then(games => {
			message.channel.send('All Time Games Played: ' + games);
		});

		const playerList = await Users.count().then(numUsers => {
			message.channel.send('All Time # of Players: ' + numUsers);
		});

		const ServerList = await Servers.count().then(numServers => {
			message.channel.send('All Time # of Servers: ' + numServers);
		});

		const questionList = await Questions.count().then(numQuestions => {
			message.channel.send('All Time # of Questions: ' + numQuestions);
		});
	
		     
	}
}
