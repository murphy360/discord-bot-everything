const fetch = require('node-fetch')
const Discord = require('discord.js')
const { ReactionCollector } = require('discord.js')
module.exports = {
  name: 'trivia',
  description: 'Trivia! based on Open Trivia DB',
  async execute(msg, args) {
    const amount = args[2];
    //const category = args[3];
    //const difficulty = args[4];
    //const type = args[5];

    //const { file } = await fetch('https://opentdb.com/api.php?amount='+amount).then(response => response.json());
    const file = await fetch('https://opentdb.com/api.php?amount='+amount).then(response => response.text());
    const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
    var triviaObject = JSON.parse(file);
    triviaObject.results[0].incorrect_answers.push(triviaObject.results[0].correct_answer);
    triviaObject.results[0].incorrect_answers.sort();  

    var correct_react = ""

    for (let i=0;i<triviaObject.results[0].incorrect_answers.length;i++) {
      if (triviaObject.results[0].incorrect_answers[i] == triviaObject.results[0].correct_answer) {
        correct_react = REACT[i];
      }
    }

    msg.channel.send(
	    'Category: ' + triviaObject.results[0].category + '\n' + 
	    'Difficulty: ' + triviaObject.results[0].difficulty + '\n' + 
	    'Question: ' + triviaObject.results[0].question).then(sentMsg => {

	     for (let i=0;i < triviaObject.results[0].incorrect_answers.length;i++) {
		sentMsg.react(REACT[i]);
	     }
             const filter = (reaction, user) => {
		     console.info(reaction.emoji.name === '\u0031\u20E3' && !user.bot);
		     return reaction.emoji.name === correct_react && !user.bot;
	    };
	     const collector = sentMsg.createReactionCollector(filter, { time: 15000 });
	     
	     collector.on('collect', (reaction, user) => {
		console.info( "Collected" );
	     });

	     collector.on('end', collected => {
		console.info( 'Collected ' + collected.size + ' items' );
	     });
	    });

    for (let i=0;i<triviaObject.results[0].incorrect_answers.length;i++) {
      let j=i+1;
      msg.channel.send(j + '. ' + triviaObject.results[0].incorrect_answers[i]);
    }
  },
};
