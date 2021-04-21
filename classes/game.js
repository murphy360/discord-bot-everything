const Question = require('./question.js');
const fetch = require('node-fetch');
class Game {
   
  
    constructor(channel, num_rounds) {
        this.ID;
        this.total_rounds = num_rounds;
        this.Questions = this.createQuestions();
        this.channel = channel;
        this.trivia_object = this.fetchObject()
    }
    
    fetchObject() {
        const file = await fetch('https://opentdb.com/api.php?amount='+this.toal_rounds).then(response => response.text());
	    retrun JSON.parse(file);
    }
    
    createQuestions() {
        Qs = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            Qs[i] = new Question(, i+1);
        }
        return Qs;
    }

}
