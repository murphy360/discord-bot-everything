const { EmbedBuilder }  = require('discord.js');
const HE = require('he');
const Sequelize = require('sequelize');
const { Answer } = require('./answer.js');
const { Timer } = require('./timer.js');
const Reactions = [
    '\u0031\u20E3',     // :one: 
    '\u0032\u20E3',     // :two:
    '\u0033\u20E3',     // :three:
    '\u0034\u20E3'];    // :four:

class Question {
    
    constructor(client, questionData, questionNumber) {
        this.client = client;                                               // bot/client
        this.question = this.cleanText(questionData.question);              // Question Text
        this.answer = this.cleanText(questionData.correct_answer);          // Answer to the Question
        this.choices = this.createChoices(questionData.incorrect_answers);  // Array of Choices (incorrect and correct answers)
        this.difficulty = questionData.difficulty;                          // Question Difficulty
        this.category = questionData.category;                              // Question Category
        this.question_num = questionNumber;                                          // Question Number in the Round
        this.num_choices = this.choices.length;                             // Number of Answer Choices (2 or 4)
        this.max_points = this.num_choices * 5;                             // Max Point Value
        this.createQuestionEmbed();                                         // Discord Message Embed for the Question
        this.displayed_at = null;                                           // Date/Time the Question was Displayed in the Channel
        this.correct_choice = this.findCorrectChoice();                     // Integer value indicating correct answer in Choices Array
        this.ID = this.storeQuestion();                                     // Question ID
        this.answers = new Array();                                         // Array of Answers
        this.winnerID = null;                                               // ID of the Winner
    }
    
    storeQuestion() {
        // store or find question in database
        // if question exists, increment times_asked counter
        return 0;
    }
    
    // Create choice array
    createChoices(wrongAnswers) {
        let choice_array = new Array();
        for (let i = 0; i < wrongAnswers.length; i++) {
            choice_array.push(this.cleanText(wrongAnswers[i]));
        }
        choice_array.push(this.answer);
        choice_array.sort();
        
        if (choice_array.length == 2) {
            choice_array.reverse();
        }
        console.info("Created Choices");
        return choice_array;
    }

    // Remove HTML Entities from text
    cleanText(dirtyText) {
        return HE.decode(dirtyText);
    }

    formatChoices() {
        let choiceString = "";
        for (let i = 0; i < this.choices.length; i++) {
            const questionNumber = i+1;
            choiceString += questionNumber + ': ' + this.choices[i] + '\n';              
        }
        return choiceString;
    }

    // Return array position of correct answer within choices
    findCorrectChoice() {
        console.info("Finding Correct Choice");
        for (let i = 0; i < this.choices.length; i++) {
            console.info(this.choices[i] + " =?= " + this.answer);
            if (this.choices[i] === this.answer){
                console.info("Correct Choice: " + this.choices[i]);
                return i;  
            }                
        }
    }

    // checks if a player has answered this question and if they are the winner
    checkAnswer(answer) {
        // check if player has already answered this question return early
        if (this.answers.some(a => a.userId === answer.userId)) {
            console.info("Player has already answered this question " + answer.userId);
            return true;
        } 
        
        // check if answer is correct and if no one has answered correctly yet set winner
        if (answer.isCorrect) {
            if (!this.answers.some(answer => answer.isCorrect)) {
                console.info("Winner! " + answer.user.username);
                answer.setGuildWinner();
            } 
        }
        console.info("Adding Answer");
        this.answers.push(answer);
        return false;

    }

    // Grade Results
    gradeResults(channel) {
        console.info("Grading Results");
        // Sort answers by points
        this.answers.sort((a, b) => (a.points > b.points) ? 1 : -1);
        this.answers.reverse();
        let embed = null;
        // Check if there is a winner
        if (this.answers.some(answer => answer.isWinner)) {
            embed = this.createQuestionWinnerEmbed();
        } else {
            embed = this.createQuestionLoserEmbed();
        }
        console.info("Sending Results Embed");
        // Send embed to channel
        channel.send({ embeds: [embed] });
    }

    // Create question loser embed
    createQuestionLoserEmbed() {
        console.info("Creating Loser Embed");
        let loserEmbed = new EmbedBuilder()
            .setTitle('Better luck next time!')
            .addFields(
                {name: 'Answer', value: this.answer},
                {name: 'Score', value: 'no points were awarded.'}
            )
            .setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
           
        return loserEmbed;
    }


    // Create question winner embed
    createQuestionWinnerEmbed() {
        console.info("Creating Winner Embed");

        // Format Score String
        let scoreString = "";
        for (let i = 0; i < this.answers.length; i++) {
            scoreString += this.answers[i].user.username + ": " + this.answers[i].points + "\n";
        }
        const winner = this.answers.find(answer => answer.isWinner);

        let winnerEmbed = new EmbedBuilder()
            .setTitle('Winner!')
            .addFields(
                {name: 'Winner', value: winner.user.username, inline: false},
                {name: 'Answer', value: this.answer, inline: false},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
           
        return winnerEmbed;
    }


    // Create question embed
    createQuestionEmbed() {
        console.info("Creating Question Embed");
        this.embed = new EmbedBuilder()
            .setColor(TRIVIA_COLOR)
            //.setAuthor('Question # ' + this.questionNumber)
            // Set the title of the field
            .setTitle(this.question)
            // Set the color of the embed
            .setColor(TRIVIA_COLOR)
            // Set the main content of the embed
            
            .addFields(
                {name: 'Choices', value: this.formatChoices(), inline: false},
                {name: 'Category', value: this.category, inline: true},
                {name: 'Difficulty', value: this.difficulty, inline: true}
            )
            // Add originGuild icon to embedd
            //.setThumbnail(this.hostGuild.iconURL())

            .setTimestamp()
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
        
        return this.embed;
    }


    
    
    // Display Question in the given Discord channel
    async ask(channel) {
        console.info("Inside question.ask()");
        this.displayed_at = Date.now();
        const question_message = await channel.send({ embeds: [this.embed] });
        for (let i = 0; i < this.num_choices; i++) {
            // add reactions
            question_message.react(Reactions[i]);
        }
        return new Promise((resolve, reject) => {

            const timer = new Timer(30, 1, channel, "It's time to answer!");
            timer.start().then(() => {
                console.info("Timer finished");
                this.gradeResults(channel);
                this.logQuestion();
                resolve();
            });


            // Create a reaction collector
            this.client.on('messageReactionAdd', async (reaction, user) => {
                console.info("REACTION: " + user.id + " from " + reaction.message.guild.name);
                
                // If timer is inactive, return early
                if (!timer.isActive) return;
                
                // Check if the reaction is on the correct message
                if (reaction.message.id !== question_message.id) return;
    
                // Check if the reaction is from the correct user
                if (user.id === this.client.user.id) return;
    
                let responseNum = "";
    
                // Check which reaction was added
                switch (reaction.emoji.name) {
                    case '\u0031\u20E3':    // :one: 
                        responseNum = 0;
                        break;
                    case '\u0032\u20E3':    // :two:
                        responseNum = 1;
                        break;
                    case '\u0033\u20E3':    // :three:
                        responseNum = 2;
                        break;
                    case '\u0034\u20E3':    // :four:
                        responseNum = 3;
                        break;
                    default:
                        // Handle other reactions
                        break;
                }
    
                // Check if the reaction is a correct choice
                const isReactionCorrect = responseNum === this.correct_choice; 
                console.info("isReactionCorrect: " + isReactionCorrect + " responseNum: " + responseNum + " correct_choice: " + this.correct_choice);
    
                // A new Answer needs to be checked if this user has already answered
                const anAnswer = new Answer(this.ID, user, reaction, isReactionCorrect, this.difficulty);
                // Only one answer allowed
                if (this.checkAnswer(anAnswer)) return;
    
    
            });

        });

        


       
      
        
    }

    // Log Question to Database
    logQuestion() {
        console.info("Logging Question");
        //TODO: Log question to database
    }

}

module.exports.Question = Question;
