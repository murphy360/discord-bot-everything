const fetch = require('node-fetch');
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
    let asyncMessage = await msg.channel.send(
	    'Category: ' + triviaObject.results[0].category + '\n' + 
	    'Difficulty: ' + triviaObject.results[0].difficulty + '\n' + 
	    'Question: ' + triviaObject.results[0].question);
    asyncMessage.react(":one:");
    msg.channel.send('1. ' + triviaObject.results[0].incorrect_answers[0]);
    msg.channel.send('2. ' + triviaObject.results[0].incorrect_answers[1]);
    msg.channel.send('3. ' + triviaObject.results[0].incorrect_answers[2]);  
    msg.channel.send('4. ' + triviaObject.results[0].incorrect_answers[3]);
    asyncMessage.react(':one:'); 
    await asyncMessage.react(':one:');
    await asyncMessage.react(':two:');
    await asyncMessage.react(':three:');
    await asyncMessage.react(':four:');

    const filter_trivia = (reaction, user) => {
	return reaction.emoji.name === ':one:' || reaction.emoji.name === ':two:' || reaction.emoji.name === ':three:' || reaction.emoji.name === ':four:';

    }

    const collector_trivia = msg.createReactionCollector(filter_trivia, {
	time: 30000,
	max: 1

    });

    collector_trivia.on('collect', async (reaction, user) => {
	if (reaction.emoji.name === ':one'){
		consone.info('one');



	}

    });
  },
};
