const { Question } = require('./question.js');
const { Intro } = require('./trivia/intro.js');
const { Player } = require('./trivia/player.js');
const { TriviaGuild } = require('./trivia/triviaGuild.js');
//const { Round } = require('./round.js');
const fetch = require('node-fetch');
//const { like } = require('sequelize/types/lib/operators.js');

class Game {
     
    constructor(client, hostMember, hostGuild, rounds, difficulty, category) {
        
        this.ID = this.storeGame();
        this.client = client;
		this.hostMember = hostMember;
		this.hostGuild = hostGuild;
        this.total_rounds = rounds;
        this.current_round = 0;
        this.difficulty = difficulty;
        this.category = category;
        this.created_on = Date.now();
        this.winner = null;
        this.players = new Array();
        this.guilds = new Array();
        this.current_round = 0;
        this.questions = new Array();
    }
    
    storeGame() {
        const database_id = 0;
        // Store game in database using sequelize
        return database_id;
    }
    
    async createQuestions() {
        console.info("createQuestions");
        const file = await fetch('https://opentdb.com/api.php?amount='+this.total_rounds).then(response => response.text());
        const json = JSON.parse(file);
	    console.info('JSON: ' + json);
        this.questions = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            this.questions[i] = new Question(this.client, json.results[i], (i + 1));
            console.info("Question: " + this.questions[i].question);
        }
        return;
    }

    async play() {
        
        await this.createQuestions();
        const intro = new Intro(this.client, this.hostMember, this.hostGuild, this.total_rounds, this.difficulty, this.category);
        await this.sendIntroToGuilds(intro);
   
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            console.info('Round ' + this.current_round + ' starting');
            await this.askQuestionToGuilds(this.questions[this.current_round]);
            console.info('Round ' + this.current_round + ' complete');
        }
        this.gradeGame();
        return;
    }

    /***** INTRO: Display Intro before game *****/
    async sendIntroToGuilds(intro) {
        
        return new Promise((resolve, reject) => {
            console.info('Inside Intro Promise');
            const guilds = this.client.guilds.cache;
            const promises = [];
            guilds.forEach((guild) => {
                console.info('Sending Intro to Guild: ' + guild.name);
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia");
                
                promises.push(intro.send(channel)); 
                //console.info('There are ' + promises.length + ' intro promises'); 
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
                //console.info('There are ' + promises.length + ' question promises'); 
            });
            
            console.info('Waiting for all promises to resolve');
            const promise = Promise.all(promises); 
            promise.then(() => {
                console.info('All promises resolved');
                resolve();
            });
            
        });
    }

    /***** INTRO: Display Intro before game *****/
    async sendScoreToGuilds(intro) {
    
        return new Promise((resolve, reject) => {
            console.info('Results');
            const guilds = this.client.guilds.cache;
            const promises = [];
            guilds.forEach((guild) => {
                console.info('Sending Score to Guild: ' + guild.name);
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia");
                
                promises.push(intro.send(channel)); 
                //console.info('There are ' + promises.length + ' intro promises'); 
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    gradeGame() {
        console.info('Grading Game');
        for (let i = 0; i < this.questions.length; i++) {
            console.info('Question ' + i + ' grading ' + this.questions[i].question);
            const answersToQuestion = this.questions[i].answers;
            for (let j = 0; j < answersToQuestion.length; j++) {
                const answer = answersToQuestion[j];
                console.info('User: ' + answer.user.username + ' id: ' + answer.user.id + ' Guild: ' + answer.guild.name + 'Guild Id: ' + answer.guild.id + ' Correct? ' + answer.isCorrect + ' Score: ' + answer.points + ' Guild Winner? ' + answer.isGuildWinner);
                
                if (this.players.find(player => player.user.id === answer.user.id) === undefined) {
                    console.info('Adding player to game: ' + answer.user.username);
                    this.players.push(new Player(answer));
                } else {
                    console.info('Player already in game: ' + answer.user.username);
                    this.players.find(player => player.user.id === answer.user.id).addAnswer(answer);
                }
                
                console.info('answer.guild.name=  ' + answer.guild.name + ' answer.guild.id = ' + answer.guild.id);
                if (this.guilds.find(triviaGuild => triviaGuild.guild.id === answer.guild.id) === undefined) {
                    console.info('Adding guild to game: ' + answer.guild.name);
                    this.guilds.push(new TriviaGuild(answer));
                } else {    
                    console.info('Guild already in game: ' + answer.guild.name);
                    this.guilds.find(guild => guild.id === answer.guild.id).addAnswer(answer);
                }


               
            }

            console.info('Question Winner: ' + this.questions[i].question.winnerId);   
        }

        for (let i = 0; i < this.players.length; i++) {
            console.info('Player: ' + this.players[i].user.username + ' Score: ' + this.players[i].currentScore);
        }

        for (let i = 0; i < this.guilds.length; i++) {
            console.info('Guild: ' + this.guilds[i].guild.name + ' Score: ' + this.guilds[i].currentScore);
        }
        // Grade the game and determine the winner
        //this.winner = this.players[0];
        //this.end();
         //TODO Player with most correct answers gets extra points
                //TODO Check if players played in two guilds 
                //TODO Guild with most correct answers gets extra points
    }

	end() {
		// Display final scoreboard
        console.info('Game Over');
		this.logGame();
	}
	
	cancel() {
		// Cancel game if requested by user
		this.logGame();
	}
	
    logGame() {
        console.info("Log Game " + this.ID);
        // post game update of the game data in sequelize database
    }
	
}

module.exports.Game = Game;
