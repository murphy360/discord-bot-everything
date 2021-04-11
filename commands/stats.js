
module.exports = {
	name: 'stats',
	description: 'print bot stats',
	async execute(message, args) {
	   			/***** Report Stats: Write an embed message with applicable stats *****/
	
		const gamesList = await Games.count().then(games => {
			message.channel.send('All Time Games Played: ' + games);
		});

		const playerList = await Users.count().then(numUsers => {
			msg.channel.send('All Time # of Players: ' + numUsers);
		});

		const ServerList = await Servers.count().then(numServers => {
			msg.channel.send('All Time # of Servers: ' + numServers);
		});

		const questionList = await Questions.count().then(numQuestions => {
			msg.channel.send('All Time # of Questions: ' + numQuestions);
		});
	
		     
	}
}
