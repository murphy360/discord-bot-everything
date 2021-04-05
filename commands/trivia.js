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
    var triviaObject = JSON.parse(file);
    console.info(triviaObject);
    triviaObject.results[0].incorrect_answers.push(triviaObject.results[0].correct_answer);
    triviaObject.results[0].incorrect_answers.sort();  
    var asyncMessage = msg.channel.send(
	    'Category: ' + triviaObject.results[0].category + '\n' + 
	    'Difficulty: ' + triviaObject.results[0].difficulty + '\n' + 
	    'Question: ' + triviaObject.results[0].question).then(sentMsg => {
		
		sentMsg.react('\u0031\u20E3');
		sentMsg.react('\u0032\u20E3');
		sentMsg.react('\u0033\u20E3');
		sentMsg.react('\u0034\u20E3');

	    }).then(async function(asyncMessage) {
		await asyncMessage.react('\u0031\u20E3');
		const filter = (reaction, user) => {
			return reaction.emoji.name === '\u0031\u20E3';
		};
		const collector = asyncMessage.createReactionCollector(filter, {
			time:15000
		});
	    });
   
    msg.channel.send('1. ' + triviaObject.results[0].incorrect_answers[0]);
    msg.channel.send('2. ' + triviaObject.results[0].incorrect_answers[1]);
    msg.channel.send('3. ' + triviaObject.results[0].incorrect_answers[2]);  
    msg.channel.send('4. ' + triviaObject.results[0].incorrect_answers[3]);
    

    collector.on('collect', (reaction, user) => {
	console.info('collected something');
    });

    collector.on('end', collected => {
	console.info('collected end');
    });
  },
};
