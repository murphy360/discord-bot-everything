const he = require('he')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const { ReactionCollector } = require('discord.js')
const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
var leaderbd = new Map();

module.exports = {
	name: 'trivia',
	description: 'Trivia! based on Open Trivia DB',
	async execute(msg, args) {


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
				.setFooter("Questions provided by https://opentdb.com","https://opentdb.com/images/logo.png")
	
			return q;
		}


	/***** LEADERBOARD: Display the final leaderboard *****/

		function leaderboard(w,game) {

			if (game) {
				msg.channel.send("```The game has ended```");

	                        players=""
        	                scores=""
	
        	                w.forEach( (value, key) => {
                	                players+=key+"\n";
                        	        scores+=value+"\n";
        	                });

				if ( players == "" ) {
					players="None"
					scores="N/A"
				}
	
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
                                        players+=key+"\n";
                                        scores+=value+"\n";
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


	/***** EXECUTEROUND: Run a round of trivia *****/

		function executeRound(triviaObj, roundNumber) {
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
					return reaction.emoji.name === correct_react && !user.bot;
				};

				const collector = sentMsg.createReactionCollector(filter, { time: 60000 });
	    
				collector.on('collect', (reaction, user) => {
                 
					if (!winners.has(user.username)) {
						winners.set(user.username, 0);
				                msg.channel.send(user.username + ' has entered the game');
					}

					if (!winnerFlag) {
						winners.set(user.username, winners.get(user.username)+points);
						points = points - 5;
						winnerFlag = true;  
						winner = user.username;  
					} else if (points > 5) {
						winners.set(user.username, winners.get(user.username)+points);
						points = points - 5;
					} else if (points == 5) {
						winners.set(user.username, winners.get(user.username)+points);
					}
		  
				});

				collector.on('end', collected => {
					numRounds--;

					const ending = new Discord.MessageEmbed()
						.setTitle("Round Results")
						.setColor("#0099ff")

					if (winner != '') {
				        	ending.addFields({name: 'Winner', value: winner, inline: true},  
								 {name: 'Score', value: winners.get(winner), inline: true},
	        			                         {name: 'The Correct Answer was:', value: cleanText(correctAnswer)}
								)
					} else {
						ending.setDescription("That was a hard one!")
						ending.addFields({name: 'The Correct Answer was:', value: correctAnswer})
					}

					msg.channel.send(ending)

					if (numRounds >= 0) {
						executeRound(triviaObject, numRounds);
					} else {
	
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

		const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());

		var triviaObject = JSON.parse(file);

		var curRound=0;

		rules();

		numRounds--;
		executeRound(triviaObject, numRounds);

	},
};
