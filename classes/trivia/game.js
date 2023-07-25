const { Question } = require('./question.js');
const { Intro } = require('./intro.js');
const { Player } = require('./player.js');
const { TriviaGuild } = require('./triviaGuild.js');
const { Sequelize } = require('sequelize');
const { Games, Questions } = require('./../../dbObjects.js');
const { QuestionManager } = require('./questionManager.js');
const { SystemCommands } = require('./../Helpers/systemCommands.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');
const fetch = require('node-fetch');
require('dotenv').config({ path: './../data/.env' });
const { ActivityType } = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
// TODO create triviaGuilds from beginning of game
class Game {
     
    constructor(client, hostUser, hostGuild, rounds, difficulty, categoryValue, categoryName) {
        
        this.ID = 0
        this.client = client;
		this.hostUser= hostUser;
		this.hostGuild = hostGuild;
        this.total_rounds = rounds;
        this.current_round = 0;
        this.difficulty = difficulty;
        this.categoryValue = categoryValue;
        this.categoryName = categoryName;
        this.created_on = Date.now();
        this.winner = null;
        this.players = new Array();
        this.triviaGuilds = new Array();
        this.current_round = 0;
        this.questions = new Array();
        this.winningUser = null;
        this.winningGuild = null;
        this.chatGPTClient = new ChatGPTClient();
        this.manager = new QuestionManager(this.client);
        this.triviaGuilds = new Array();
        this.getTriviaGuilds();
        
    }

    async getTriviaGuilds() {
        const guilds = this.client.guilds.cache;
        guilds.forEach((guild) => {
            this.triviaGuilds.push(new TriviaGuild(guild));
        });
    }
    
    async storeGame(endType) {
        const DBgame = await Games.findOne({ where: { game_id: this.ID, game_end_type: endType } });
 
        if (DBgame) {
            console.info('Game found in database, updating game_end: ' + this.ID);
            DBgame.update({ game_end: Sequelize.fn('datetime', 'now') });
        } else {
            
            const game = await Games.create({ 
                host_player_id: this.hostUser.id, 
                host_guild_id: this.hostGuild.id, 
                game_start: Sequelize.fn('datetime', 'now'),
                game_end_type: endType, 
            });
            this.ID = game.game_id;
            console.info('Creating entry for new game. ' + this.ID);
        }
    }

    // check if category is a comma separated list of categories and return an array of categories
    async splitCategories(category) {
        let categoryArray = [];
        if (category.includes(',')) {
            categoryArray = category.split(',');
        } else {
            categoryArray.push(category);
        }
        for (let i = 0; i < categoryArray.length; i++) {
            categoryArray[i] = categoryArray[i].trim();
        }
        return categoryArray;
    }

    async getQuestions(numQuestions, category, difficulty) {
        console.info("createQuestions");
        let questions = new Array();
        // if this.hostUser is my bot, then try to split the category into an array of categories
        if (this.hostUser.id === this.client.user.id) {
            const categories = await this.splitCategories(category);
            const numQuestionsPerCategory = Math.floor(numQuestions / categories.length);
            for (let i = 0; i < categories.length; i++) {
                questions = questions.concat(await this.manager.getDBQuestions(numQuestionsPerCategory, categories[i], difficulty));
            }
        } else {
            questions = await this.manager.getDBQuestions(numQuestions, category, difficulty);
        }
       
        for (let i = 0; i < questions.length; i++) {
            questions[i].questionNumber = i + 1;
        }
        return questions;
    }
    
    async play(introTimerSec) {
        this.questions = await this.getQuestions(this.total_rounds, this.categoryName, this.difficulty);
        const intro = new Intro(this.client, this.hostUser, this.hostGuild, this.total_rounds, this.difficulty, this.categoryName, this.ID.toString(), introTimerSec);
        await intro.setDescription();
        await this.sendIntroToGuilds(intro);
        const status = 'Trivia Game #' + this.ID;
        this.client.user.setActivity(status, { type: ActivityType.Playing });
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            await this.askQuestionToGuilds(this.questions[this.current_round]);
        }
        
        // await this.gradeGame(); and see what the resolve is
        await this.gradeGame().then(resolve => {
            console.info('Game ended with resolve: ' + resolve);
            // Only send score to guilds if the game ended with a winner
            switch (resolve) {
                case 'Grading Complete':
                    this.sendScoreToGuilds(this.winningUser, this.winningGuild);
                    break;
                case 'No Players Answered Any Questions':
                    // TODO: Send message to guilds that no one answered any questions
                    break;
                case 'Game Ended in Tie':
                    // TODO: Send message to guilds that game ended in a tie
                    break;
                default:
                    console.info('Game ended with no winner');
                    break;
            }
           return resolve;
        });
    }

    /***** INTRO: Display Intro before game *****/
    async sendIntroToGuilds(intro) {
        
        return new Promise((resolve, reject) => {
            
            const promises = [];
            this.triviaGuilds.forEach((triviaGuild) => {
                if (triviaGuild.isReady) {
                    promises.push(intro.send(triviaGuild.triviaChannel)); 
                } else {
                    console.log('intro.js: ' + triviaGuild.guild.name + ' is not setup properly');
               }     
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    // Ask a question to all guilds, returns once the question has been answered from each
    async askQuestionToGuilds(question) {
        return new Promise(async (resolve, reject) => {
            console.info('game.js: Asking Question: ' + question.question_num+ ', ' + question.question + '\nAnswer: ' + question.answer);
            const promises = [];
            this.triviaGuilds.forEach((triviaGuild) => {
                
                // Find TRIVIA_CHANNEL
                if (triviaGuild.isReady) {
                    console.info('question.js: Sending Question to Guild: ' + triviaGuild.guild.name);
                    promises.push(question.ask(triviaGuild.triviaChannel)); 
                } else {
                    console.log('question.js: ' + triviaGuild.guild.name + ' is not setup properly');
                }
            });
            
            console.info('Waiting for all promises to resolve for question ' + question.question_num);
            const promise = Promise.all(promises); 
            promise.then(() => {
                console.info('All promises resolved for question ' + question.question_num);
                resolve();
            });
        });
    }

    /***** Send Results Scoreboards to Guilds *****/
    async sendScoreToGuilds() {
    
        return new Promise((resolve, reject) => {
            console.info('Results');
            const promises = [];
            this.triviaGuilds.forEach((triviaGuild) => {
                if (triviaGuild.isReady) {
                    console.info('Sending Score to Guild: ' + triviaGuild.guild.name);
                    promises.push(triviaGuild.sendGameGuildScoreBoard(this.winningUser, this.winningGuild)); 
                } else {
                    console.log('game.js: ' + triviaGuild.guild.name + ' is not setup properly');
                }
                
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    async gradeGame() {
        console.info('Grading Game');
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < this.questions.length; i++) {
                console.info('Question ' + i + ' grading ' + this.questions[i].question);
                const answersToQuestion = this.questions[i].answers;

                for (let j = 0; j < answersToQuestion.length; j++) {
                    const answer = answersToQuestion[j];

                    // Add the player to the game if they are not already in it
                    let answerPlayer = this.players.find(player => player.user.id === answer.user.id);
                    if (answerPlayer === undefined) {
                        answerPlayer = new Player(answer.user);
                        await answerPlayer.storePlayerToDb();
                        
                        this.players.push(answerPlayer); // TODO I'd like to move this logic to the end of each question
                    } 

                    await answerPlayer.addAnswer(answer);
                    
                    // Add the guild to the game if it is not already in it
                    let answerGuild = this.triviaGuilds.find(triviaGuild => triviaGuild.guild.id === answer.guild.id);
                    if (answerGuild) {
                        answerGuild.addAnswer(answer);
                       
                    } else {    
                        console.info('game.js: Guild not a triviaGuild ' + answer.guild.name);
                    } 

                    // Add the player to the guild if they are not already in it
                    if (!answerGuild.players.includes(answerPlayer)) {
                        await answerGuild.addPlayer(answerPlayer);
                    }
                }  
            }

            // Sort the players by score highest to lowest      
            this.players.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
            this.players.reverse();
 
            if (this.players.length === 0) {
                resolve("No Players Answered Any Questions");
                return;
            } else if (this.players[0].currentScore === 0) {
                resolve("No Players Answered Any Questions Correctly");
                return;
            }

            if (this.players.length > 1) {
                if (this.players[0].currentScore === this.players[1].currentScore) {
                    resolve("Game Ended in Tie");
                    // TODO Handle Tie
                }
            }

            this.winningUser = this.players[0].user;
            this.players[0].user.username;
            console.info('Winning Member: ' + this.winningUser.username);

            // Sort the guilds by score
            this.triviaGuilds.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
            this.triviaGuilds.reverse();
            

            this.winningGuild = this.triviaGuilds[0].guild;
            console.info('Winning Guild: ' + this.winningGuild.name);

            // Store Player stats to database
            for (let i = 0; i < this.players.length; i++) {
                console.info('Player: ' + this.players[i].user.username + ' Score: ' + this.players[i].currentScore);
                this.players[i].storePlayerToDb();
            }

            // TODO Store Guild stats to database
            for (let i = 0; i < this.triviaGuilds.length; i++) {
                console.info('Guild: ' + this.triviaGuilds[i].guild.name + ' Score: ' + this.triviaGuilds[i].currentScore);
                // TODO Address ties
                this.triviaGuilds[i].storeGuildToDb();
            }

            resolve("Grading Complete");
        });
    }

    async init() {
        // Display intro and add game to database
        console.info('Game Init');
        await this.storeGame('Initialized');
    }

	async end() {
		// Display final scoreboard
        console.info('Game Over');
        return new Promise((resolve, reject) => {
            this.storeGame('Completed').then(async () => {
                const numPlayers = await this.manager.getNumberOfPlayersInDatabase();
                const gamesPlayed = await this.manager.getNumberOfGamesPlayed();
                
                const status = 'Trivia with ' + numPlayers + ' players. ' + gamesPlayed + ' games played.';
                this.client.user.setActivity(status, { type: ActivityType.Watching });
                resolve();
            });           
        });
	}
	
	cancel() {
		// Cancel game if requested by user
        console.info('Game Cancelled');
		this.storeGame('Cancelled');
	}
	
	
}

module.exports.Game = Game;
