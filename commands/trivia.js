const he = require('he');
const fetch = require('node-fetch');
const Sequelize = require('sequelize');
const Discord = require('discord.js');
const { ReactionCollector } = require('discord.js');
const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
var leaderbd = new Map();
var q_time; // question time variable to shorten waiting time during testing
var game_in_progres = false;

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
	name: 'trivia',
	description: 'Trivia! based on Open Trivia DB',
	async execute(msg, args, client) {


/********** FUNCTION DEFINITIONS **********/


/***** RULES: Display Rules in an embed message *****/

		function rules() {

			const rules = new Discord.MessageEmbed()
				.setTitle("Trivia Rules")
				.setColor("#0099ff")
				.setDescription("Welcome to Trivia. This was created by Corey Murphy and Christian Acord")
				.addField("How to Play","When the question is displayed react with the corresponding number to the correct (or incorrect) answer.")
	 		msg.channel.send(rules);
		}



	/***** TIMER: Sets a timer displaying a progress bar countdown *****/

		function timer(time,interval,text) {

			let pBar = function(theBar) {
				time-=interval;

				if (time == 0) {
					theBar.edit("```Time is Up!```");
					clearInterval(p)
					return;
				} else {
					theBar.edit(text+"\n"+getBar(time,60,30));
				}
	        	}

			let intv=interval*1000;

			msg.channel.send(text+"\n"+getBar(time,60,30)).then(msg => { p = setInterval(pBar,intv,msg) });
	    	}



	/***** GETBAR: Build the Progress Bar for Timer *****/
 
		function getBar(value, maxValue, size) {
			const percentage = value / maxValue;
			const progress = Math.round((size * percentage));
			const emptyProgress = size - progress;
			const progressText = '▇'.repeat(progress);
			const emptyProgressText = ' '.repeat(emptyProgress);
			const bar = '```[' + progressText + emptyProgressText + ']```';

			return bar;
	    	}
    


	/***** CLEANTEXT: Remove HTML Entities and replace with characters *****/

		function cleanText(dirtyText) {
			var cleanText = dirtyText;
			cleanText = he.decode(dirtyText);
			return cleanText;
		}



	/***** GETQUESTION EMBED: Display questions to channel with an embed *****/

		function getQuestionEmbed(triviaOjb, roundNumber, qNum) {
			choices = ""
	
			for (let i = 0; i < triviaObject.results[numRounds].incorrect_answers.length ; i++) {
	                	j = i+1;
	                	choices += "\n" + j + ". " + triviaObject.results[numRounds].incorrect_answers[i];
	        	}
	
			choices = cleanText(choices);
	
			const q = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setAuthor('Question #'+qNum)
				.addFields({name: 'Choices', value: choices},
				           {name: 'Category', value: cleanText(triviaObject.results[roundNumber].category), inline: true},
					   {name: 'Difficulty', value: cleanText(triviaObject.results[roundNumber].difficulty), inline: true}
		  			  )
				.setTitle(cleanText(triviaObject.results[roundNumber].question))
				.setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
				.setFooter("Question provided by The Open Trivia Database (https://opentdb.com)","https://opentdb.com/images/logo.png")
	
			return q;
		}


	/***** LEADERBOARD: Display the final leaderboard *****/

		async function leaderboard(w, game) {
		

			if (game) {
	        	players=""
				scores=""

				if ( w.size <= 0 ) {
				    players="None"
					scores="N/A"
				} else {
		        	w.forEach( (value, key) => {
						let j = client.users.fetch(key);
						j.then(function(result1) {
			               	players+=result1.username+"\n";
                        	scores+=value+"\n";
						});
        	    	});
				}

				await reportStats(msg, client);	

				const leaders = new Discord.MessageEmbed()
					.setTitle("Game Results")
					.setDescription("Scoreboard for the last game")
					.setColor("#0099ff")
					.addFields({name: "Players", value: players, inline: true},
					{name: "Scores", value: scores, inline: true}
					);
				msg.channel.send(leaders);
			} else {
				
				// Build overall Leaderboard here

				players=""
				scores=""
				w.forEach( (value, key) => {
	                console.info('adding player string');
					let j = client.users.fetch(key);
					j.then(function(result1) {
						console.info('lookup: ' + result1.username);
						players+=result1.username+"\n";
        			                scores+=value+"\n";
					});
				});

				if ( players == "" ) {
					players="None"
					scores="N/A"
				}

				const leaders = new Discord.MessageEmbed()
					.setTitle("Leader Board")
					.setDescription("Current all-time trivia leaderboard stats")
					.setColor("#0099ff")
					.addFields({name: "Players", value: players, inline:true},
						   {name: "Scores", value: scores, inline: true}
						  );

				msg.channel.send(leaders);
			}
		}

		/***** Identify to the winner is *****/
		function calculateWinner(winnersMap) {
			var winner = null;
			console.info('calcWinner: ' + winner);
			winnersMap.forEach((value,key)=>{
				console.info('calcWinner key: ' + key);
				if(winner == null){
					winner = key;
					console.info('calcWinner == null: ' + winner);
				}else if(value > winnersMap.get(winner)){
					winner = key;
					console.info('calcWinner >: ' + winner);
				}else if(value == winnersMap.get(winner)){
					console.info('There is a tie');
				};
			});

			if(winnersMap.get(winner) === 0){
				return null;
			}
			console.info('calcWinner return: ' + winner);
			return winner;
		}
	
	/***** adds new user to database *****/
	async function logUser(message, user) {
		try{
			console.info('Logging user: ' + user.id);
			const newUser = await Users.create({
				user_id: user.id,
				user_name: user.username,
			});
			message.channel.send('Everyone welcome ' + user.username + ' it is their first time playing!'); 
		
		}catch(e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				return console.info('That user already exists.');
				
			}
			return message.channel.send('Something went wrong with adding a tag.');
		}
	}

	/***** log that we're playing a game on this server *****/
	async function logServer(message) {
		const server = await Servers.findOne({
			where: { server_id: message.guild.id } });
		if (server === null) {
			console.info('First time with this server');
			try{
				console.info('Logging server: ' + message.guild.name);
				const newServer = await Servers.create({
					server_id: message.guild.id,
					server_name: message.guild.name,
				});
				message.channel.send('Hey thanks for the invite! it is my first time on this server!');
			}catch(e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					return console.info('That server already exists.');    
				}
				return message.channel.send('Something went wrong with loggin the server');       
			}
		} else {
			console.info('This server exists in the db');
		}
		
	}
	/*** Log Game: save reference to this game to db ***/
		async function logGame(message, winner) {
			let winnerObj = await client.users.fetch(winner.id).then(theWinner => {
				if (winnerObj !== null){
					msg.channel.send("```Game Over!!!\n\nWinner: " + winner.username + "```");
				} else {
					msg.channel.send("```Game Over!!!\n\nNo Winner!```");
				}
			
				const game = await Games.create({
					game_id: message.id,
					creator_id: message.author.id,
					creator_name: message.author.username,
					game_start: message.createdAt,
					game_end: Date.now(),
					winner_id: winner,
					server_id: message.guild.id,
				});
			});
			
		}
		
		/***** Report Stats: Write an embed message with applicable stats *****/
		async function reportStats(message, client) {
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

		async function logResponse(isWinner, points, user, message, round, reaction, questionTime, answerTime, questionId) {
			console.info('logResponse');
			const userObj = await Users.findOne({ where:
				{
					user_id: user.id
				}});
			if (userObj === null) {
				//first time user on this bot
				logUser(msg, user);
			} else {
				console.info('User already resides on the server')
			}

			const response = await Responses.findOne({ where: 
				{
					user_id: user.id,
					game_id: message.id,
					round_number: round
			}});
			const correctAnswer = points>0;
			if (response === null) {
				console.info('not found logging response for ' + user.username);
				const loggedResponse = await Responses.create({
					game_id: message.id,
					user_id: user.id,
					round_number: round,
					question_id: questionId,
	       	        q_time: questionTime,
	       	        a_time: answerTime,
	       	        correct: correctAnswer,
	       	        points: points,
	       	        winner: isWinner,
				});
			} else {
				console.info(user.username + ' has already answered');
			}
		}

		async function logQuestion(triviaObj, roundNumber, chaff0, chaff1, chaff2, message){
			const questionObj = await Questions.findOne({ where:
				{
					question: triviaObj.results[roundNumber].question
				}});

			if (questionObj !== null){
				console.info('Existing Question need to link to current round');
				return questionObj.question_id;
			} else {
				console.info('New Question: need to log it');
				const newQuestion = await Questions.create({
					question: triviaObj.results[roundNumber].question,
					correct_answer: triviaObj.results[roundNumber].correct_answer,
					answer2: chaff0,
	       	        answer3: chaff1,
	       	        answer4: chaff2,
	       	        category: triviaObj.results[roundNumber].category,
	       	        difficulty: triviaObj.results[roundNumber].difficulty
				});
				newQuestion.then(value => {
					return value.question_id;
				});
			}
		}


	/***** EXECUTEROUND: Run a round of trivia *****/

		async function executeRound(triviaObj, roundNumber) {

			game_in_progress=true;
			var players = new Map();
			curRound++;
			var winnerFlag = false;
			var winner = null;
			var correctAnswer = triviaObject.results[roundNumber].correct_answer;
			var questionTimeStamp = Date.now();
			var chaffQuestion0 = triviaObject.results[roundNumber].incorrect_answers[0];
			var chaffQuestion1 = triviaObject.results[roundNumber].incorrect_answers[1];
			var chaffQuestion2 = triviaObject.results[roundNumber].incorrect_answers[2];
			console.info(correctAnswer);
			var questionId = null;
			var questionIdPromise = logQuestion(triviaObj, roundNumber, chaffQuestion0, chaffQuestion1, chaffQuestion2, msg);
			questionIdPromise.then(value => {
				questionId = value;
			});
	    	triviaObject.results[roundNumber].incorrect_answers.push(triviaObject.results[roundNumber].correct_answer);

			triviaObj.results[roundNumber].incorrect_answers.sort();

			//if true and false put them in the other order
			if (triviaObject.results[roundNumber].incorrect_answers.length == 2) {
				triviaObject.results[roundNumber].incorrect_answers.reverse()
			}

			var points = triviaObj.results[roundNumber].incorrect_answers.length * 5;

			console.info("Points = " + points);

	    	var correct_react = "";

			for (let i=0;i<triviaObj.results[roundNumber].incorrect_answers.length;i++) {
				if (triviaObj.results[roundNumber].incorrect_answers[i] == triviaObj.results[roundNumber].correct_answer) {
					correct_react = REACT[i];
				}
			}


			if (args[2] == 1) {
				// DO NOTHING

	       	} else if (curRound == args[2]) {
				msg.channel.send('**Final Round is starting**');
//				timer(20,4,'**Final Round begin soon...**');
			} else {
				msg.channel.send('**Round #' + curRound + ' of ' + args[2] + ' is starting**'); 
//				timer(20,4,'**Round #'+curRound+' of '+args[2]+' will start soon...**');
			}

			msg.channel.send(getQuestionEmbed(triviaObj, roundNumber, curRound)).then(sentMsg => {

				for (let i=0;i < triviaObj.results[roundNumber].incorrect_answers.length;i++) {
					sentMsg.react(REACT[i]);
				}
				timer(q_time,5,'Time Remaining');

				const filter = (reaction, user) => {
					//make sure each player has an entry and initial score of 0
					if (!user.bot && !winners.has(user.id)){
						console.info('adding ' + user.username + ' to winners list');
						winners.set(user.id,0);
						msg.channel.send(user.username + ' has entered the game');
						console.info('added ' + user.username + ' to winners list, current score: ' + winners.get(user.id));
					}
					// Correct answer and first response and not a bot
					if (reaction.emoji.name === correct_react && !players.has(user.id) && !user.bot) {
						players.set(user.id,0);
						console.info(user.username + ' Answered correctly and made it through the filter');
						return true;
					}else if (!players.has(user.id) && !user.bot) {
						players.set(user.id,0);
						console.info(user.username + ' Answered incorrectly (or again) and response is being logged to disk');
						logResponse(false, 0, user, msg, curRound, reaction, questionTimeStamp, Date.now(), questionId);
						return false; 
					}else{
						console.info(user.username + ' is being ignored');
					}
		        }
				

				const collector = sentMsg.createReactionCollector(filter, { time: q_time*1000 });
				collector.on('collect', (reaction, user) => {
					var isWinner = false;
					if (!winnerFlag) {
						winnerFlag = true;
						isWinner = true;
						winner = user;
					}else if (points > 5) {
						points = points - 5;
					}
					//winners is used for tracking total game score
					const currentScore = winners.get(user.id);
					console.info(user.username + ' current score: ' + currentScore + ' plus ' + points);
					winners.set(user.id, currentScore+points);
					logResponse(isWinner, points, user, msg, curRound, reaction, questionTimeStamp, Date.now(), questionId);
				});

				collector.on('end', collected => {
					numRounds--;
					console.info('on end');
					const ending = new Discord.MessageEmbed()
						.setTitle("Round Results")
						.setColor("#0099ff")
					
					
					if (winner !== null) {
						console.info('winner: ' + winner.username + ' Score: ' + winners.get(winner.id));
						ending.addFields(
							{name: 'Winner', value: winner.username, inline: true},  
							{name: 'Score', value: winners.get(winner.id), inline: true},
							{name: 'The Correct Answer was:', value: cleanText(correctAnswer)
						});
					} else {
						console.info('No Winner for ROund ' + curRound);
						ending.setDescription("That was a hard one!")
						ending.addFields({name: 'The Correct Answer was:', value: correctAnswer})
					}
					msg.channel.send(ending)
					if (numRounds >= 0) {
						console.info('Round: ' + numRounds);
						executeRound(triviaObj, numRounds);
					} else {
						try {
							console.info('TRY');
							logGame(msg, calculateWinner(winners));
						} catch (e) {
							console.info(e);
						}
						leaderboard(winners, true);
						game_in_progress=false;
					}
				});
			});
		}

/********** EXECUTION CODE **********/

		var winners = new Map();
        var curRound=0;

		if (args[2].toLowerCase() === 'rules') {
			rules();
			return;
		} else if (args[2].toLowerCase() === 'leaderboard') {
			leaderboard(leaderbd, false);
			return;
		} else if (args[2].toLowerCase() === 'scores') {
			if (game_in_progres) {
				leaderboard(winners, true);
			} else {
				leaderboard(leaderbd, false);
			}
		}
		
		q_time=60;
		
		if (args[3] > 0) {
			q_time=args[3];
		}

		var numRounds = args[2];

                const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());
                var triviaObject = JSON.parse(file);

		rules();

		logServer(msg);
		numRounds--;

//		timer(20,4,"Game will begin soon. Get Ready!");

		executeRound(triviaObject, numRounds);
	},
};
