const fetch = require('node-fetch')
const Discord = require('discord.js')
const { ReactionCollector } = require('discord.js')
module.exports = {
  name: 'trivia',
  description: 'Trivia! based on Open Trivia DB',
  async execute(msg, args) {
    if(args[2].toLowerCase() === 'rules'){
	msg.channel.send('RULES\n\n\nFirst correct answer gets the most points, subsequent answers will get ddecreasing points.  \n\n\nClick on numbered emojis to answer.');
	return;    
    }

    var numRounds = args[2];
    var winners = new Map();

    const file = await fetch('https://opentdb.com/api.php?amount='+numRounds).then(response => response.text());
    const REACT=['\u0031\u20E3', '\u0032\u20E3','\u0033\u20E3','\u0034\u20E3'];
    var triviaObject = JSON.parse(file);

    var curRound=0;
    
    function rules() {
      msg.channel.send('+----------------------------------------------------+');
    }


    async function timer() {

        var v=60;
        const pBar = await msg.channel.send(getBar(v,60,30));

        var b  = setInterval(function() {
                if (v == 0) { pBar.delete(); clearInterval(b); return; }
                v--;
                pBar.edit(getBar(v,60,30));
                console.info('time: '+v);
        },1000);

    }

    function getBar(value, maxValue, size) {
	const percentage = value / maxValue; // Calculate the percentage of the bar
	const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
	const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.
	const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
	const emptyProgressText = ' '.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
	const bar = '```[' + progressText + emptyProgressText + '] :' + value + '```'; // Creating the bar
	return bar;
    }
    
    /* Prints the string reuquired to sent a trivia question   
     */
    function getQuestionMessage(triviaObj, roundNumber) {
	var message = '```Category: ' + triviaObject.results[roundNumber].category + '\n' +
		      'Difficulty: ' + triviaObject.results[roundNumber].difficulty + '\n' +
		      'Question: ' + triviaObject.results[roundNumber].question+'```';

	for (let i=0; i < triviaObject.results[numRounds].incorrect_answers.length ; i++) {
                message += "\n" + REACT[i] + " - " + triviaObject.results[numRounds].incorrect_answers[i];
	}	
	return message;
    }


    function executeRound(triviaObj, roundNumber) {
	curRound++;
	var winnerFlag = false;
	var winner = '';
	var correctAnswer = triviaObject.results[roundNumber].correct_answer;
	console.info(correctAnswer);
    	triviaObject.results[roundNumber].incorrect_answers.push(triviaObject.results[roundNumber].correct_answer);
    	if (triviaObject.results[roundNumber].incorrect_answers.length > 2) {triviaObject.results[roundNumber].incorrect_answers.sort()};  
	var points = triviaObject.results[roundNumber].incorrect_answers.length * 5;
	console.info("Points = " + points);
    	var correct_react = ""

    	for (let i=0;i<triviaObject.results[roundNumber].incorrect_answers.length;i++) {
      		if (triviaObject.results[roundNumber].incorrect_answers[i] == triviaObject.results[roundNumber].correct_answer) {
        		correct_react = REACT[i];
      		}
    	}

	if (args[2] == 1) {
        } else if (curRound == args[2]) {
	  msg.channel.send(' \n\n**Final Round**');
	} else {
          msg.channel.send(' \n\n**Round #'+curRound+' of '+args[2]+'**');
	}

    	msg.channel.send(getQuestionMessage(triviaObj, roundNumber)).then(sentMsg => {

	     for (let i=0;i < triviaObject.results[roundNumber].incorrect_answers.length;i++) {
		sentMsg.react(REACT[i]);
	     }


	timer();

             const filter = (reaction, user) => {
		     return reaction.emoji.name === correct_react && !user.bot;
	    };
	     const collector = sentMsg.createReactionCollector(filter, { time: 60000 });
	     
	     collector.on('collect', (reaction, user) => {
                  
		  if(!winners.has(user.username)){
			winners.set(user.username, 0);
                        msg.channel.send(user.username + ' has entered the game');
		  }
		  if(!winnerFlag){
			winners.set(user.username, winners.get(user.username)+points);
			points = points - 5;
			winnerFlag = true;  
			winner = user.username;  
		  }else if (points > 5){
			winners.set(user.username, winners.get(user.username)+points);
			points = points - 5;
		  }else if (points > 5) {
			winners.set(user.username, winners.get(user.username)+points);
		  }
		  
	     });

	     collector.on('end', collected => {
		numRounds--;
		if(winner != ''){
		        msg.channel.send('```Winner: ' + winner + ' - Score: ' + winners.get(winner)+'\nThe correct answer was: '+correctAnswer+'```');

	        }else{
                        msg.channel.send('```That was a hard one!\nThe correct answer was: ' + correctAnswer+'```');
                }

		if(numRounds >= 0) {

//			msg.channel.send("----------------\n\n\nNext Round");
			executeRound(triviaObject, numRounds);
		}else{
//			msg.channel.send("----------------");
//			msg.channel.send("----------------");
//			msg.channel.send("----------------");
			msg.channel.send("Game Over");
//			msg.channel.send("----------------");
			winners.forEach( (value, key) => {
				msg.channel.send('```'+key+': '+ value+'```');  

			});
		}
	     });
	    });

    }

  numRounds--;
  executeRound(triviaObject, numRounds);

  },
};
