const he = require('he');
const fetch = require('node-fetch');
const Sequelize = require('sequelize');
const Discord = require('discord.js');
const { ReactionCollector } = require('discord.js');
const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
var leaderbd = new Map();
const sequelize = new Sequelize('database', 'user', 'password', {
	                host: 'localhost',
	                dialect: 'sqlite',
	                logging: false,
	                storage: 'database.sqlite',
});

const Games = require('./../models/Games')(sequelize, Sequelize.DataTypes);
const Users = require('./../models/Users')(sequelize, Sequelize.DataTypes);
const Servers = require('./../models/Users')(sequelize, Sequelize.DataTypes);

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

		function timer(time,interval) {

			let pBar = function(theBar) {
				time-=interval;

				if (time == 0) {
					theBar.edit("```Time is Up!```");
					clearInterval(p)
					return;
				} else {
					theBar.edit(getBar(time,60,30));
				}
	        	}

			let intv=interval*1000;

			msg.channel.send(getBar(time,60,30)).then(msg => { p = setInterval(pBar,intv,msg) });
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
				}else {

				

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
					.setTitle("Leader Board")
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
		async function logUser(message, user, isWinner) {
			try{


	        		console.info('Logging user: ' + user.id);
	                	const newUser = await Users.create({
					user_id: user.id,
					user_name: user.username,
				});
				message.channel.send('Everyone welcome ' + user.username + ' it is their first time playing!'); 
			
			}catch(e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					console.info('That user already exists.');
					return msg.channel.send(user.username + ' has entered the game');
				}
				return message.channel.send('Something went wrong with adding a tag.');

			}
		}
		
		async function logServer(message) {
			try{
                        	console.info('Logging server: ' + message.guild.name);
				const newServer = await Servers.create({
					server_id: message.guild.id,
					server_name: message.guild.id,
				});
				message.channel.send('Hey thanks for the invite! it is my first time on this server!');
	                }catch(e) {
		                        if (e.name === 'SequelizeUniqueConstraintError') {
			                        console.info('That server already exists.');
			                        return
			                }
			                return message.channel.send('Something went wrong with loggin the server');
	                       
			}
		
		}

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
			console.info('calcWinner return: ' + winner);
			return winner;
			
		}

	/*** Log Game: save reference to this game to db ***/
		async function logGame(message, winner) {
			let winnerObj = client.users.fetch(winner);
			winnerObj.then(function(result1) {
				
				msg.channel.send("```Game Over!!!'''" + "\n\n''' Winner: " + result1.username + "'''");
			});
			const game = await Games.create({
				game_id: message.id,
				creator_id: message.author.id,
				creator_name: message.author.username,
				game_start: message.createdAt,
				winner_id: winner,
			});
		}
		
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

		}
		async function processRound() {


		}


	/***** EXECUTEROUND: Run a round of trivia *****/

		async function executeRound(triviaObj, roundNumber) {
			curRound++;
			var winnerFlag = false;
			var winner = '';
			var correctAnswer = triviaObject.results[roundNumber].correct_answer;

			console.info(correctAnswer);

	    		triviaObject.results[roundNumber].incorrect_answers.push(triviaObject.results[roundNumber].correct_answer);

			triviaObject.results[roundNumber].incorrect_answers.sort();

			if (triviaObject.results[roundNumber].incorrect_answers.length == 2) {
				triviaObject.results[roundNumber].incorrect_answers.reverse()
			}

			var points = triviaObject.results[roundNumber].incorrect_answers.length * 5;

			console.info("Points = " + points);

	    		var correct_react = ""

		    	for (let i=0;i<triviaObject.results[roundNumber].incorrect_answers.length;i++) {
	      			if (triviaObject.results[roundNumber].incorrect_answers[i] == triviaObject.results[roundNumber].correct_answer) {
	        			correct_react = REACT[i];
	      			}
			}


			if (args[2] == 1) {
				// DO NOTHING
	       		} else if (curRound == args[2]) {
				 msg.channel.send(' \n\n**Final Round**');
			} else {
		       		msg.channel.send(' \n\n**Round #'+curRound+' of '+args[2]+'**');
			}

			msg.channel.send(getQuestionEmbed(triviaObj, roundNumber, curRound)).then(sentMsg => {

				for (let i=0;i < triviaObject.results[roundNumber].incorrect_answers.length;i++) {
					sentMsg.react(REACT[i]);
				}

				timer(60,5);

		        const filter = (reaction, user) => {
				if (!winners.has(user.id) && !user.bot) {
					winners.set(user.id,0);                                 
					//msg.channel.send(user.username + ' has entered the game');
					try{

						logUser(msg, user, false);
					}catch(e) {

						console.info(e);
					}
		                }
				return reaction.emoji.name === correct_react && !user.bot;
			};

				const collector = sentMsg.createReactionCollector(filter, { time: 60000 });
	    
				collector.on('collect', (reaction, user) => {
                 
					if (!winnerFlag) {
						winners.set(user.id, winners.get(user.id)+points);
						points = points - 5;
						winnerFlag = true;  
						winner = user.id;  
					} else if (points > 5) {
						winners.set(user.id, winners.get(user.id)+points);
						points = points - 5;
					} else if (points == 5) {
						winners.set(user.id, winners.get(user.id)+points);
					}
		  
				});

				collector.on('end', collected => {
					numRounds--;
					console.info('on end');
					const ending = new Discord.MessageEmbed()
						.setTitle("Round Results")
					        .setColor("#0099ff")
					

					console.info('winner: ' + winner);
					if (winner != '') {
						let winnerObj = client.users.fetch(winner);
						winnerObj.then(function(result1) {

				        	ending.addFields({name: 'Winner', value: result1.username, inline: true},  
								 {name: 'Score', value: winners.get(winner), inline: true},
	        			                         {name: 'The Correct Answer was:', value: cleanText(correctAnswer)}
						)
						});
					} else {
						ending.setDescription("That was a hard one!")
						ending.addFields({name: 'The Correct Answer was:', value: correctAnswer})
					}
					msg.channel.send(ending)
					if (numRounds >= 0) {
						console.info('Round: ' + numRounds);
						executeRound(triviaObject, numRounds);
					} else {
					
						try {
							console.info('TRY');
							logGame(msg, calculateWinner(winners));
						} catch (e) {
							console.info(e);
							//msg.channel.send(e);
						}

						leaderboard(winners, true);
					}
				});
		   
			});
		}


/********** EXECUTION CODE **********/

		if (args[2].toLowerCase() === 'rules') {
			rules();
			return;
		} else if (args[2].toLowerCase() === 'leaderboard' || args[2].toLowerCase() === 'scores') {
			leaderboard(leaderbd, false);
			return;
		}

		var numRounds = args[2];
		var winners = new Map();
		console.info('fetch file');
		const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());

		var triviaObject = JSON.parse(file);

		var curRound=0;

		rules();
		logServer(msg);
		numRounds--;
		executeRound(triviaObject, numRounds);
		//sequelize.close();

	},
};