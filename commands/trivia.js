const fetch = require('node-fetch')
const Discord = require('discord.js')
const { ReactionCollector } = require('discord.js')
module.exports = {
  name: 'trivia',
  description: 'Trivia! based on Open Trivia DB',
  async execute(msg, args) {
    var numRounds = args[2];

    const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());
    const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
    var triviaObject = JSON.parse(file);
    
    function executeRound(triviaObj, roundNumber) {

	console.info(triviaObject.results[roundNumber].correct_answer);
    	triviaObject.results[roundNumber].incorrect_answers.push(triviaObject.results[roundNumber].correct_answer);
    	triviaObject.results[roundNumber].incorrect_answers.sort();  

    	var correct_react = ""

    	for (let i=0;i<triviaObject.results[roundNumber].incorrect_answers.length;i++) {
      		if (triviaObject.results[roundNumber].incorrect_answers[i] == triviaObject.results[roundNumber].correct_answer) {
        		correct_react = REACT[i];
      		}
    	}

    	msg.channel.send(
	    'Category: ' + triviaObject.results[roundNumber].category + '\n' + 
	    'Difficulty: ' + triviaObject.results[roundNumber].difficulty + '\n' + 
	    'Question: ' + triviaObject.results[roundNumber].question).then(sentMsg => {

	     for (let i=0;i < triviaObject.results[roundNumber].incorrect_answers.length;i++) {
		sentMsg.react(REACT[i]);
	     }
             const filter = (reaction, user) => {
		     return reaction.emoji.name === correct_react && !user.bot;
	    };
	     const collector = sentMsg.createReactionCollector(filter, { time: 15000 });
	     
	     collector.on('collect', (reaction, user) => {
                msg.channel.send(user.username + 'Got the right answer!!!');
	     });

	     collector.on('end', collected => {
		numRounds--;
		if(numRounds >= 0) {
			msg.channel.send("\n\n\nNext Round");
			executeRound(triviaObject, numRounds);
		}else{
			msg.channel.send("Game Over");
		}
	     });
	    });

    for (let i=0; i < triviaObject.results[numRounds].incorrect_answers.length ; i++) {
      		let j=i+1;
      		msg.channel.send(j + '. ' + triviaObject.results[numRounds].incorrect_answers[i]);
    }
	
    }

  numRounds--;
  executeRound(triviaObject, numRounds);

  },
};
