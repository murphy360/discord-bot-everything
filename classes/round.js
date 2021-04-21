const Question = require('./question.js');
const Timer = require('./timer.js');
const Response = require('./response.js');
const Discord = require('Discord');
const Reactions=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];

class Round {
    
    constructor(game_id, question, round_num, channel) {
        this.winner = null;
        this.players = null;
        this.question = question;
        this.channel = channel;
        this.question_message = null;
        this.time = 60;
        this.timer = null;
        this.stated_at = null;
        this.responses = new Array();
        this.parent_game = game_id;
    }
    
    play() {
        this.started_at = Date.now();
        this.channel.send('Round ' + round_num + ' starting');
        this.presentQuestion();
        this.collectUserReactions();       
    }
    
    presentQuestion() {
        this.question_message = this.question.display(this.channel);
        
        for (let i = 0; i < this.question.num_choices; i++) {
            // add reactions
            this.question_message.react(Reaction[i]);
        }
        
        this.timer = new Timer.Timer(this.time,5,this.channel,'Time Remaining').start();
        
    }
    
    collectUserReactions() {
        // use collector and filters
    }
    
    getQuestionTimeLength() {
        switch (this.question.difficulty) {
            case 'easy': 
                this.time = 30;
                break;
            case 'medium': 
                this.time = 45;
                break;
            default: 
                this.time = 60;
                break;
        }
    }
    
    end() {
    }
    
    logRound() {
    }
    
    getWinner() {
        return this.winner;
    }
}

module.exports.Round = Round
