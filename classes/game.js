const Question = require('./question.js');
const Rounds = require('./round.js');
const fetch = require('node-fetch');

class Game {
     
    constructor(channel, num_rounds) {
        this.ID = this.storeGame();
        this.total_rounds = num_rounds;
        this.questions = this.createQuestions();
        this.rounds = this.createRounds();
        this.channel = channel;
        this.winner = null;
        this.players = new Array();
        this.created_on = Date.now();
        this.current_round = 0;
	    this.started_by = ""
    }
    
    storeGame() {
        // Store game in database using sequelize
        // return database id
    }
    
    createQuestions() {
        const file = fetch('https://opentdb.com/api.php?amount='+this.total_rounds).then(response => response.text());
	    let json = JSON.parse(file);
	    
        Qs = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            Qs[i] = new Question(json.results[i], (i + 1));
        }
        return Qs;
    }
    
    createRounds() {
        Rnds = new Array();
        for (let i = 0; i < this.total_rounds; i++) {
            Rnds[i] = new Round(this.ID, this.questions[i], (i + 1));
        }
        return Rnds;
    }
    
    start(channel) {
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            this.rounds[this.current_round].play(channel);
        }
    }

    logGame() {
        // post game update of the game data in sequelize database
    }
	
}

module.exports.Game = Game;
