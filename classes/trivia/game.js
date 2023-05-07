const { Question } = require('./question.js');
const { Intro } = require('./intro.js');
const { Player } = require('./player.js');
const { TriviaGuild } = require('./triviaGuild.js');
const { Sequelize } = require('sequelize');
const { Games } = require('./../../dbObjects.js');
//const { Round } = require('./round.js');
const fetch = require('node-fetch');
//const { like } = require('sequelize/types/lib/operators.js');
// TODO create triviaGuilds from beginning of game
class Game {
     
    constructor(client, hostMember, hostGuild, rounds, difficulty, categoryValue, categoryName) {
        
        this.ID = 0
        this.client = client;
		this.hostMember = hostMember;
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
        this.winningMember = null;
        this.winningGuild = null;
    }
    
    async storeGame(endType) {
        const DBgame = await Games.findOne({ where: { game_id: this.ID, game_end_type: endType } });
 
        if (DBgame) {
            console.info('Game found in database, updating game_end: ' + this.ID);
            DBgame.update({ game_end: Sequelize.fn('datetime', 'now') });
        } else {
            
            const game = await Games.create({ 
                host_player_id: this.hostMember.id, 
                host_guild_id: this.hostGuild.id, 
                game_start: Sequelize.fn('datetime', 'now'),
                game_end_type: endType, 
            });
            this.ID = game.game_id;
            console.info('Creating entry for new game. ' + this.ID);
        }
    }

    async getTDBQuestions() {
        console.info("createQuestions");
        let url = 'https://opentdb.com/api.php?amount='+this.total_rounds;
        if (this.difficulty !== 'all') {
            url = url + '&difficulty=' + this.difficulty;
        }
        console.info('categoryName: ' + this.categoryName);
        if (this.categoryName !== 'All') {
            url = url + '&category=' + this.categoryValue;
        }
        console.info('URL: ' + url);
        const file = await fetch(url).then(response => response.text());
        const json = JSON.parse(file);
	    console.info('JSON: ' + json);

        this.questions = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            this.questions[i] = new Question(this.client, json.results[i], (i + 1), 'https://opentdb.com' );
            console.info("Question: " + this.questions[i].question);
        }
        return;
    }
    
    async createQuestions() {
        console.info("createQuestions");
        let url = 'https://opentdb.com/api.php?amount='+this.total_rounds;
        if (this.difficulty !== 'all') {
            url = url + '&difficulty=' + this.difficulty;
        }
        if (this.categoryName !== 'All') {
            url = url + '&category=' + this.categoryValue;
        }
        const file = await fetch(url).then(response => response.text());
        const json = JSON.parse(file);

        this.questions = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            this.questions[i] = new Question(this.client, json.results[i], (i + 1), 'https://opentdb.com' );
        }
        return;
    }

    async play() {
        
        await this.createQuestions();
        const intro = new Intro(this.client, this.hostMember, this.hostGuild, this.total_rounds, this.difficulty, this.categoryName, this.ID.toString());
        await this.sendIntroToGuilds(intro);
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            await this.askQuestionToGuilds(this.questions[this.current_round]);
        }
        await this.gradeGame();
        this.sendScoreToGuilds(this.winningMember, this.winningGuild);
        return;
    }

    /***** INTRO: Display Intro before game *****/
    async sendIntroToGuilds(intro) {
        
        return new Promise((resolve, reject) => {
            const guilds = this.client.guilds.cache;
            const promises = [];
            guilds.forEach((guild) => {
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia");
    
                promises.push(intro.send(channel)); 
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    // Ask a question to all guilds, returns once the question has been answered from each
    async askQuestionToGuilds(question) {
        return new Promise((resolve, reject) => {
            console.info('Inside Question Promise');
            const guilds = this.client.guilds.cache;
            const promises = [];
            guilds.forEach((guild) => {
                console.info('Sending Question to Guild: ' + guild.name);
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia");
                promises.push(question.ask(channel)); 
            });
            
            console.info('Waiting for all promises to resolve');
            const promise = Promise.all(promises); 
            promise.then(() => {
                console.info('All promises resolved');
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
                console.info('Sending Score to Guild: ' + triviaGuild.guild.name);
                promises.push(triviaGuild.sendGameGuildScoreBoard(this.winningMember, this.winningGuild)); 
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    gradeGame() {
        console.info('Grading Game');
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.questions.length; i++) {
                console.info('Question ' + i + ' grading ' + this.questions[i].question);
                const answersToQuestion = this.questions[i].answers;

                for (let j = 0; j < answersToQuestion.length; j++) {
                    const answer = answersToQuestion[j];

                    // Add the player to the game if they are not already in it
                    let answerPlayer = this.players.find(player => player.user.id === answer.user.id);
                    if (answerPlayer === undefined) {
                        answerPlayer = new Player(answer);
                        this.players.push(answerPlayer); // TODO I'd like to move this logic to the end of each question
                    } else {
                        answerPlayer.addAnswer(answer);
                    }
                    
                    // Add the guild to the game if it is not already in it
                    let answerGuild = this.triviaGuilds.find(triviaGuild => triviaGuild.guild.id === answer.guild.id);
                    if (answerGuild === undefined) {
                        answerGuild = new TriviaGuild(answer); // TODO I'd like to move this logic to the end of each question
                        this.triviaGuilds.push(answerGuild);
                    } else {    
                        answerGuild.addAnswer(answer);
                    } 

                    // Add the player to the guild if they are not already in it
                    if (!answerGuild.players.includes(answerPlayer)) {
                        answerGuild.addPlayer(answerPlayer);
                    }
                }  
            }

            // Sort the players by score highest to lowest      
            this.players.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
            this.players.reverse();
            for (let i = 0; i < this.players.length; i++) {
                console.info('Player: ' + this.players[i].user.username + ' Score: ' + this.players[i].currentScore);
                // TODO Address ties
            }
            this.winningMember = this.players[0].user;
            this.players[0].user.username;
            console.info('Winning Member: ' + this.winningMember.username);

            // Sort the guilds by score
            this.triviaGuilds.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
            this.triviaGuilds.reverse();
            
            for (let i = 0; i < this.triviaGuilds.length; i++) {
                console.info('Guild: ' + this.triviaGuilds[i].guild.name + ' Score: ' + this.triviaGuilds[i].currentScore);
                // TODO Address ties
            }
            this.winningGuild = this.triviaGuilds[0].guild;
            console.info('Winning Guild: ' + this.winningGuild.name);
            resolve("Grading Complete");
        });
    }

    async init() {
        // Display intro and add game to database
        console.info('Game Init');
        await this.storeGame('Initialized');
    }

	end() {
		// Display final scoreboard
        console.info('Game Over');
		this.storeGame('Completed');
	}
	
	cancel() {
		// Cancel game if requested by user
        console.info('Game Cancelled');
		this.storeGame('Cancelled');
	}
	
	
}

module.exports.Game = Game;
