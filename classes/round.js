const Question = require('./question.js');
const Timer = require('./timer.js');
const Response = require('./response.js');
const Participant = requre('./participant.js');
const Discord = require('Discord');
const Reactions = [
    '\u0031\u20E3',     // :one: 
    '\u0032\u20E3',     // :two:
    '\u0033\u20E3',     // :three:
    '\u0034\u20E3'];    // :four:

class Round {
    
    constructor(game_id, question, round_num, channel) {
        this.winner = null;                         // winning participant
        this.participants = null;                   // round participants
        this.question = question;                   // this round's question
        this.channel = channel;                     // trivia game channel
        this.question_message = null;               // reference to the question message
        this.time = this.getQuestionTime();         // time length to display question
        this.timer = null;                          // reference to timer
        this.stated_at = null;                      // time the round started
        this.responses = new Array();               // participant responses
        this.parent_game = game_id;                 // parent game id
    }
    
    play() {
        this.started_at = Date.now();
        this.channel.send('Round ' + round_num + ' starting');
        this.presentQuestion();
        this.collectUserReactions();
        this.end();
        return this.winner;
    }
    
    presentQuestion() {
        this.question_message = this.question.display(this.channel);
        
        for (let i = 0; i < this.question.num_choices; i++) {
            // add reactions
            this.question_message.react(Reactions[i]);
        }
        
        this.timer = new Timer.Timer(this.time,5,this.channel,'Time Remaining').start();
    }
    
    collectUserReactions() {
        // use collector and filters
    }
    
    getQuestionTime() {
        let time = 0;
        switch (this.question.difficulty) {
            case 'easy': 
                time = 30;
                break;
            case 'medium': 
                time = 45;
                break;
            default: 
                time = 60;
                break;
        }
        
        return time;
    }
    
    end() {
    }
    
    getWinner() {
        return this.winner;
    }
}

module.exports.Round = Round
