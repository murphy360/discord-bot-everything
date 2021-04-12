const he = require('he');
const fetch = require('node-fetch');
const Sequelize = require('sequelize');
const Discord = require('discord.js');
const { ReactionCollector } = require('discord.js');
const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
var leaderbd = new Map();
var userNameId = new Map();
var q_time; // question time variable to shorten waiting time during testing
var game_in_progres = false;
//var questionId = '';

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

	/***** ABOUT: Display about information include authors and source information *****/
		function about() {
			const about = new Discord.MessageEmbed()
				.setAuthor('Trivia Game')
				.setColor("#0099ff")
				.setTitle("About "+client.user.username+"'s Trivia Game")
				.setDescription("This bot was created by Corey Murphy and Christian Acord")
				.setImage("https://opentdb.com/images/logo.png")
				.addFields({name:"Question provided by the Open Trivia Database", value: "The questions used in are provided by by [https://opentdb.com/](https://opentdb.com). All data provided by the API is available under the Creative Commons Attribution-ShareAlike 4.0 International License."})
				.setFooter("Updated: 11 April 2021")
				.setThumbnail("https://icon-library.com/images/bot-icon/bot-icon-3.jpg")
			msg.channel.send(about)
		}


	/***** INTRO: Display Intro before game *****/
		function intro() {
			const intro = new Discord.MessageEmbed()
				.setAuthor('Trivia Game')
				.setColor("#0099ff")
				.setTitle(msg.author.username+" has challenged everyone to a game of trivia.")
				.setDescription("As the questions are displayed answer by reacting to the question with the correct emoji.")
			msg.channel.send(intro);
		}


	/***** RULES: Display Rules in an embed message *****/

		function rules() {

			const rules = new Discord.MessageEmbed()
				.setAuthor(msg.author.username+", welcome to trivia hosted by "+client.user.username)
				.setTitle("Trivia Rules")
				.setColor("#0099ff")
				.setDescription("This trivia game was created by Corey Murphy and Christian Acord. It uses questions from [https://opentdb.com](https://opentdb.com).")
				.addField("How to Play","When the question is displayed react with the corresponding number to the correct (or incorrect) answer.")
				.addField("The first correct answer receives the most points","Subsequent answers are reduced to a minimum of 5 points")
				.addField("You get one chance","Subsequent reactions are ignored.")
				.addField("Incorrect answers","Incorrect answers receive no score")

	 		msg.author.send(rules);
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

		function getQuestionEmbed(triviaObj, roundNumber, qNum) {
			choices = ""
	
			for (let i = 0; i < triviaObj.results[roundNumber].incorrect_answers.length ; i++) {
	                	j = i+1;
	                	choices += "\n" + j + ". " + triviaObj.results[roundNumber].incorrect_answers[i];
	        	}
	
			choices = cleanText(choices);
	
			const q = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setAuthor('Question #'+qNum)
				.addFields({name: 'Choices', value: choices},
				           {name: 'Category', value: cleanText(triviaObj.results[roundNumber].category), inline: true},
					   {name: 'Difficulty', value: cleanText(triviaObj.results[roundNumber].difficulty), inline: true}
		  			  )
				.setTitle(cleanText(triviaObj.results[roundNumber].question))
				.setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
				.setFooter("Question provided by The Open Trivia Database (https://opentdb.com)","https://opentdb.com/images/logo.png")
	
			return q;
		}


	/***** LEADERBOARD: Display the final leaderboard *****/

		async function leaderboard(w, game, winner) {
			console.info('Leaderboard ');
		

			if (game) {
				
				let players=""
				let scores=""
				if ( w.size <= 0 ) {
					players="None"
					scores="N/A"
				} else {
					w.forEach( (value, key) => {
						players+=userNameId.get(key)+"\n";
						scores+=value+"\n";
					});
				}
				
				var leaderText = "No Winner";
				if (winner !== null){
					leaderText = "Congrats to our winner, " + winner.username;
				}

				console.info('Leader Text: ' + leaderText);
				console.info('player text: ' + players);
				console.info('scores: ' + scores);
				const leaders = new Discord.MessageEmbed()
					.setTitle("Game Results")
					.setDescription(leaderText)
					.setColor("#0099ff")
					.addFields(
						{name: "Players", value: players, inline: true},
						{name: "Scores", value: scores, inline: true}
					);
					
				msg.channel.send(leaders);
			} else {
				
				// Build overall Leaderboard here

				players=""
				scores=""
				pArr=""
				sArr=""
				count=0;

				w.forEach( (value, key) => {
		
		        	        console.info('adding player string');

					let j = client.users.fetch(key);
					j.then(function(result1) {
						console.info('lookup: ' + result1.username);
						pArr[count]=result1.username+"\n";
        			                sArr[count]=value+"\n";
						count++
					});
				});

				if ( players == "" ) {
					players="None"
					scores="N/A"
				} else {
					len=players.length;
					for (let j=0;j<sArr.length;j++) {
						max=0;
						pos=0;
						for (let i=j;i<sArr.length;i++) {
							if (sArr[i]>max) {
								pos=i;
							}
						}

						swap=sArr[j];
						sArr[j]=sArr[pos];
						sARr[pos]=swap;

						swap=pArr[j];
						pArr[j]=pArr[pos];
						pArr[pos]=swap;
					}

					for (let i=0;i<sArr.length;i++) {
						players+=pArr[i]+"\n";
						scores+=sArr[i]+"\n";
					}

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
			
			
			var winnerID = null;
			if(winner !== null){
				console.info('logGame post if ' + winner.username);
				winnerID = winner.id;
			}
			const game = await Games.create({
				game_id: message.id,
				creator_id: message.author.id,
				creator_name: message.author.username,
				game_start: message.createdAt,
				game_end: Date.now(),
				winner_id: winnerID,
				server_id: message.guild.id,
			});
		}
		


		async function logResponse(isWinner, points, user, message, round, reaction, questionTime, answerTime, questionId) {
			console.info('logResponse question: ' + questionId);
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
				}
			});

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

		/**
		 * I absolutely intend to offer the comments below with compassion and respect.
		 * I hope that comes through in text.
		 * 
		 * ------
		 * (1) What does this function do?  (Maybe:  "test if the the specified
		 * question exists in our database, create it if not, and return the
		 * ID either way." ?)  If that's what it does, I'd suggest changing the
		 * name. As is, the name "logQuestion" suggests (say) you're reporting
		 * (logging) the existence of a question, not searching-and-creating.
		 * Perhaps "findOrCreateQuestion()" ?
		 * 
		 * CM:  Change Made 100% Agree
		 * 
		 * TODO adopt better naming convention for all functions.  
		 * 
		 * (2) I don't know what a lot of these objects do, or what their purpose is.
		 * I'm only commenting, below, on the syntax. If I say some naive/silly/dumb
		 * things, please forgive me. I'm trying to help you clean up the syntax
		 * and JavaScript concepts; I realize I don't know about the data being processed. 
		 * 
		 * Sequelize ideally returns an Object that can interact with the database... still trying to wrap our heads around it.  
		 * As far as data, we're pulling questions in JSON format that we can extract 
		 * - Question
		 * - Correct Answer
		 * - 1-3 Incorrect answers
		 * - difficulty
		 * - genre
		 * 
		 * We've defined our database tables in the models directory
		 * 
		 * (3) I'd recommend putting a try/catch around the calls to `findOne` and
		 * `create()`.  I didn't do that here because I don't know the errors
		 * your database might return, and because I'm adding enough noise below
		 * that I didn't want to muddy things.  I can comment on your try/catch in a
		 * later PR.
		 * 
		 * TODO Add Try/Catch around all Async functions.  
		 * 
		 * (4) Please test this code before merging it!!!  I haven't even installed
		 * Node.  I'm just (again) responding to syntax.
		 * 
		 * (5) Is this `Questions.create()` process a database call?
		 * 
		 * If so: I'd recommend against (ever) waiting on a database to do
		 * something for you.  Even if it should be instantaneous, it can
		 * often not be. There's probably a way to think about the design
		 * which would let you queue up this "create" process and, later,
		 * incorporate the results from it.  Same goes for almost everything
		 * you can do asynchronously.
         * 
		 * Analogy:  you ask me to get you a burrito (`ron.burritoFactory.create()`).
		 * Do you hover over my desk until until the burrito magically appears?
		 * For all you know, I decided to go home and drop off something for my
		 * wife, because I didn't realize you were waiting for me.  You CAN wait for
		 * me (you can make the burrito-creation process synchronous), but it might
		 * be better to set up a casual, social notification system: "hey, Ron,
		 * when you've got my burrito, would you leave it on my desk and text me?"
		 * Doing that doesn't really "make" it asynchronous; it shows that the situation
		 * truly is fundamentally asynchronous -- we're indepdent people working
		 * independently, not separate sides of the same cog in a machine.  It thus
		 * helps you and me take advantage of the truly asynchronous nature of the situation.
		 * 
		 * That analogy translates exactly into code. When this "create" process
		 * is done, you  can have it post the results in some variable you can access,
		 * and then (if necessary to do it separately) post a message somewhere that will
		 * let your UI-or-whatever know there's more data to be shown.
		 */
		async function findOrCreateQuestion(triviaObj, roundNumber, chaff0, chaff1, chaff2, message) {

			// ------------------------------------------------------------------
			// Ron's Version
			// ------------------------------------------------------------------

			/*
			 I'm going to insert a whole new block of code showing what I
			 think you intend from this function. Then, below, I'll make comments
			 on your original code.
			 */

			// Result of this function:  the ID of the resulting question, whether
			// it already exists or we have to create it.
			var questionId;

			// We use this array-lookup a lot, so let's do it once to avoid potential typos.
			let triviaResult = triviaObj.results [roundNumber];

			// We're asking the database to find questions where the "question" field
			// matches the thing we just got passed.  Here's how it wants us to ask:
			// a JavaScript object with one field, "where", containing aNOTHER JavaScript
			// object containing the actual query.
			let searchCriteria = { where: {
				question: triviaResult.question
			}};

			// Ask the database to find the specified question. Twiddle our thumbs
			// (wait patiently) until the answer comes back. Hopefully it'll be fast,
			// but don't count on it.
			let existingQuestion = null;
			try {
				existingQuestion = await Questions.findOne (searchCriteria);
			} catch (e) {
				console.info('ERRROR: '+e.name);
			}
			

			// If we got something back from the database, hooray!  We're done.
			if (existingQuestion) {
				questionId = existingQuestion.id;
				console.info('existing question id: ' + questionId);
			}

			// Didn't get anything back from the database.  No problem.
			// Let's create the Question under discussion.
			else {
				// Here's the data we need to store in the database.
				let questionToCreate = {
					question:		triviaResult.question,
					correct_answer: triviaResult.correct_answer,
					answer2:		chaff0,
					answer3: 		chaff1,
					answer4: 		chaff2,
					category: 		triviaResult.category,
					difficulty: 	triviaResult.difficulty
				};

				// Ask the database to create that object. Wait patiently
				// until it replies. Expect delays.
				let createdQuestion = await Questions.create (questionToCreate);

				// Hooray!  Done.
				questionId = createdQuestion.id;
				
				console.info('new question id: ' + questionId);
			}

			// By the time we get here, we have guaranteed that we have an actual
			// question with an actual ID... or, if we couldn't do that, we've generated
			// `undefined` or `null` or some other reasonable result meaning "we could neither
			// find nor create that question."
			return questionId;


			// ------------------------------------------------------------------
			// Original Version
			// ------------------------------------------------------------------

			console.info("findOrCreateQuestion1");

			/*
			 I don't think this line does what you think.

			 Compare these 2 lines:
			 
			 		let questionPromise = Questions.findOne ( ... )
					let question        = await Questions.findOne ( ... )

			 If you call a function marked `async`, you get the Promise,
			 instantly, before any other code executes.

			 If you "await" that function, you don't get a promise; you get
			 the thing that was actually promised -- but you might be waiting
			 for a long time. That means the UI and other things should NOT
			 be sitting around waiting on this.
			 */
			const questionObj = await Questions.findOne ({ where: {
				question: triviaObj.results[roundNumber].question
			}});

			console.info("findOrCreateQuestion2");	
			
			if (questionObj !== null){
				/*
				 Here's the syntax:

				 	Questions
						.findOne (...)
						.then (...)
						.then (...)

				It can get a little (not much) more complex than that, but that's
				the basic part.

				Each successive `then()` gets fed the `return`ed value from the
				previous function call.

				But that only works if the thing you're calling is a Promise,
				not an actual answer.

				So I think the `then` here won't function as you expect. Given your
				`await` in `const questionObj = await Questions.findOne (...)` above,
				by the time you get here, `questionObj` is the actual thing you were
				waiting for, not a Promise to get you one of those things. So you can
				just say `questionObj.id`; you don't have to (and can't) say
				`questionObj.then(...)`.
				 */
				questionObj.then(value => {
					console.info(value instanceof Questions);
					console.info('Existing question: ' + value.id);
					return value.id;
				});
				
			} else {
				console.info('New Question: need to log it');

				/*
				 As written, this `newQuestion` value gets set to `value.id` from the
				 `then()` clause, but it isn't being used.
				*/
				const newQuestion = await Questions.create({
					question: triviaObj.results[roundNumber].question,
					correct_answer: triviaObj.results[roundNumber].correct_answer,
					answer2: chaff0,
	       	        answer3: chaff1,
	       	        answer4: chaff2,
	       	        category: triviaObj.results[roundNumber].category,
	       	        difficulty: triviaObj.results[roundNumber].difficulty

				}).then(value => {
					console.info ("Is `value` an instance of the `Questions` class? [" + value instanceof Questions + "]");
					console.info ('Creating new Question with id [' + value.id + ']');

					// Note:  this value is global, because we weren't sure how to get it out of this function (yet!)
					//questionId = value.id;

					// We'd love to use this, but haven't figured out how yet
					return value.id;
				});
			}
		}

		async function calculateWinner(message, winnersMap){
			console.info('inside calculatewinner');
			var gameWinner = null;
			var tempScore = 0;
			var tempId = "";
			if (winnersMap.size > 0){
				winnersMap.forEach((values, keys) => {
					if (values > tempScore){
						tempId = keys;
						tempScore = values;
					}
					console.log("values: ", values +
					  ", keys: ", keys + "\n")
					console.log("values: ", tempScore +
					  ", keys: ", tempId + "\n")
				  });
	
				if (tempScore > 0) {
					console.info('Best Score ' + tempScore);
					let promise = await client.users.fetch(tempId).then( function(result1) {
						console.info('inside then trying to assign gameWinner');
						gameWinner = result1;
						console.info('Winner: ' + gameWinner.username);
						logGame(message, gameWinner);
						leaderboard(winners, true, gameWinner);
					});
				} else {
					logGame(message, null);
					leaderboard(winners, true, null);
				}
			} else {
				logGame(message, null);
				leaderboard(winners, true, null);
			}
			
			return gameWinner;
		}
	/***** EXECUTEROUND: Run a round of trivia *****/

		async function executeRound(triviaObj, roundNumber) {

			game_in_progress=true;
			var players = new Map();
			curRound++;
			var winnerFlag = false;
			var winner = null;
			var questionId = null;
			console.info("round number: " + roundNumber);
			
			var correctAnswer = triviaObj.results[roundNumber].correct_answer;
			var questionTimeStamp = Date.now();
			var chaffQuestion0 = triviaObj.results[roundNumber].incorrect_answers[0];
			var chaffQuestion1 = triviaObj.results[roundNumber].incorrect_answers[1];
			var chaffQuestion2 = triviaObj.results[roundNumber].incorrect_answers[2];
			console.info(correctAnswer);

			questionId = await findOrCreateQuestion(triviaObj, roundNumber, chaffQuestion0, chaffQuestion1, chaffQuestion2, msg);
			
				
			console.info("Received Question ID outside then: " + questionId);
			
			
		    	triviaObj.results[roundNumber].incorrect_answers.push(triviaObj.results[roundNumber].correct_answer);

			triviaObj.results[roundNumber].incorrect_answers.sort();

			//if true and false put them in the other order
			if (triviaObj.results[roundNumber].incorrect_answers.length == 2) {
				triviaObj.results[roundNumber].incorrect_answers.reverse()
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
						userNameId.set(user.id,user.username);
						msg.channel.send(user.username + ' has entered the game');
						console.info('added ' + user.username + ' to winners list, current score: ' + winners.get(user.id));
					}
					// Correct answer and first response and not a bot
					if (reaction.emoji.name === correct_react && !players.has(user.id) && !user.bot) {
						players.set(user.id,0);
						console.info(user.username + ' Answered correctly and made it through the filter');
						return true;
					} else if (!players.has(user.id) && !user.bot) {
						players.set(user.id,0);
						console.info(user.username + ' Answered incorrectly and response is being logged to disk');
						
						console.info("Question ID: " + questionId);
						logResponse(false, 0, user, msg, curRound, reaction, questionTimeStamp, Date.now(), questionId);
						return false; 
					} else {
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
					} else if (points > 5) {
						points = points - 5;
					}

					//winners is used for tracking total game score
					const currentScore = winners.get(user.id);
					console.info(user.username + ' current score: ' + currentScore + ' plus ' + points);
					winners.set(user.id, currentScore+points);
					
					console.info("Question ID: " + questionId);
					logResponse(isWinner, points, user, msg, curRound, reaction, questionTimeStamp, Date.now(), questionId);
				});

				collector.on('end', collected => {
					
					console.info('on end');
					const ending = new Discord.MessageEmbed()
						.setTitle("Round Results")
						.setColor("#0099ff")
					
					if (winner !== null) {
						console.info('winner: ' + winner.username + ' Score: ' + winners.get(winner.id));
						ending.setDescription(winner.username+" won this round")
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

					roundNumber--;
					if (roundNumber >= 0) {
						console.info('Round: ' + roundNumber);
						executeRound(triviaObj, roundNumber);

					} else {
						console.info('Start Calculate Winner');
						const gameWinner = calculateWinner(msg, winners);
						
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
				leaderboard(winners, true, null);
				return;
			} else {
				leaderboard(leaderbd, false);
				return;
			}
		} else if (args[2].toLowerCase() === 'about') {
			about();
			return;
		} else if (args[2]%1 == 0) {

			q_time=60;
		
			if (args[3] > 0) {
				q_time=args[3];
			}

			var numRounds = args[2];

			console.info('Round: ' + numRounds);
		
			console.info('Round: ' + numRounds); 
			const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());
			var triviaObj = JSON.parse(file);
			numRounds--;
		
			intro();

			logServer(msg);
			console.info("Before executeRound: " + numRounds);
			executeRound(triviaObj, numRounds);
			
		} else if (args[2].toLowerCase() === "stats") {
			msg.channel.send("Stats called, but not built");
			return;
		} else {
			msg.channel.send("Unrecognized trivia command");
			return;
		}
	},
};
