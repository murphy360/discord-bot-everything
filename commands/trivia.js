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
    const REACT=[‘u0031\u20E3’,‘u0032\u20E3’,‘u0033\u20E3’,‘u0034\u20E3’];
    var triviaObject = JSON.parse(file);
    console.info(triviaObject);
    triviaObject.results[0].incorrect_answers.push(triviaObject.results[0].correct_answer);
    triviaObject.results[0].incorrect_answers.sort();  
    let asyncMessage = await msg.channel.send(
	    'Category: ' + triviaObject.results[0].category + '\n' + 
	    'Difficulty: ' + triviaObject.results[0].difficulty + '\n' + 
	    'Question: ' + triviaObject.results[0].question.replace('&quot;','"').then(sentMsg => {

	      for (let i=0;i<triviaObject.results[0].incorrect_answers.length;i++) {
		sentMsg.react(REACT[i]);
              }

	    });

    for (let i=0;i<triviaObject.results[0].incorrect_answers.length;i++) {
      let j=i+1;
      msg.channel.send(j + '. ' + triviaObject.results[0].incorrect_answers[i]);
    }

    const filter = (reaction, user) => {
	console.info("in the filter");
	return 1;
	    //return reaction.emoji.name === '\u0031\u20E3' || reaction.emoji.name === '\u0032\u20E3' || reaction.emoji.name === '\u0033\u20E3' || reaction.emoji.name === '\u0034\u20E3';

    };

    const collector = asyncMessage.createReactionCollector(filter, { time: 10000, max: 1 });
	
    collector.on('collect', async (reaction, user) => {
	console.info('collected something');
    });

    collector.on('end', collected => {
	console.info('collected end');
    });
  },
};
