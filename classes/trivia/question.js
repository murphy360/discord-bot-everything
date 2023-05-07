const { EmbedBuilder }  = require('discord.js');
const HE = require('he');
const { Sequelize } = require('sequelize');
const { Questions } = require('./../../dbObjects.js');
const { Answer } = require('./answer.js');
const { Timer } = require('../common/timer.js');
const Reactions = [
    '\u0031\u20E3',     // :one: 
    '\u0032\u20E3',     // :two:
    '\u0033\u20E3',     // :three:
    '\u0034\u20E3'];    // :four:

class Question {
    
    constructor(client, questionData, questionNumber, source) {
        this.timerSec = 10;                                                 // Time to answer the question
        this.ID = null;                                                     // Question ID
        this.client = client; 
        this.source = source;                                              // bot/client
        this.owner = null;                                                 // User who added the question to the database
        this.question = this.cleanText(questionData.question);              // Question Text
        this.answer = this.cleanText(questionData.correct_answer);          // Answer to the Question
        this.choices = this.createChoices(questionData.incorrect_answers);  // Array of Choices (incorrect and correct answers)
        this.questionType = this.cleanText(questionData.type);              // Question Type
        this.difficulty = questionData.difficulty;                          // Question Difficulty
        this.category = questionData.category;                              // Question Category
        this.question_num = questionNumber;                                 // Question Number in the Round
        this.num_choices = this.choices.length;                             // Number of Answer Choices (2 or 4)
        this.max_points = this.num_choices * 5;                             // Max Point Value
        this.createQuestionEmbed();                                         // Discord Message Embed for the Question
        this.last_asked = null;                                           // Date/Time the Question was Displayed in the Channel
        this.correct_choice = this.findCorrectChoice();                     // Integer value indicating correct answer in Choices Array
        this.answers = new Array();                                         // Array of Answers
        this.questionOwnerUserID = null;                                     // Player who answered the question correctly first
        this.questionOwnerGuildID = null;                                    // Guild where the question was answered correctly first
        this.sourceID = null;                                               // ID of the question from the source
        this.times_asked = 0;                                               // Number of times the question has been asked
        this.storeQuestion();                                     // Question ID
        this.times_answered = 0;                                            // Number of times the question has been answered
        this.times_answered_correctly = 0;                                  // Number of times the question has been answered correctly
    
    }
    
    syncQuestion() {
        const DBquestion = Questions.findOne({ where: { question_text: this.question } });
        this.questionOwnerUserID = DBquestion.question_owner_user_id;
        this.questionOwnerGuildID = DBquestion.question_owner_guild_id;
        this.last_asked = DBquestion.last_asked;
        this.times_asked = DBquestion.times_asked;
        this.times_answered = DBquestion.times_answered;
    }

    async storeQuestion() {
        let DBquestion = await Questions.findOne({ where: { question_id: this.ID } });
        if (!DBquestion || this.ID == null) {
            DBquestion = await Questions.create({ 
                question_text: this.question,
                source: this.source,
                source_id: this.sourceID,
                question_type: this.questionType,
                category: this.category,
                difficulty: this.difficulty,
                question: this.question,
                correct_answer: this.answer,
                answer2: this.choices[0],
                answer3: this.choices[1],
                answer4: this.choices[2],
                times_asked: this.times_asked,
                times_answered: this.times_answered,
                times_answered_correctly: this.times_answered_correctly,
                last_asked: this.last_asked,
                owner_guild_id: this.questionOwnerGuildID,
                owner_user_id: this.questionOwnerUserID,
                times_answered: this.times_answered,
            });
            
            
        } else { 
            DBquestion.update({ 
                question_text: this.question,
                source: this.source,
                source_id: this.sourceID,
                question_type: this.questionType,
                category: this.category,
                difficulty: this.difficulty,
                question: this.question,
                correct_answer: this.answer,
                answer2: this.choices[0],
                answer3: this.choices[1],
                answer4: this.choices[2],
                times_asked: this.times_asked,
                times_answered: this.times_answered,
                times_answered_correctly: this.times_answered_correctly,
                last_asked: this.last_asked,
                owner_guild_id: this.questionOwnerGuildID,
                owner_user_id: this.questionOwnerUserID,
                times_answered: this.times_answered,
            });
        }
        this.ID = DBquestion.question_id;
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
            //console.info(this.choices[i] + " =?= " + this.answer);
            if (this.choices[i] === this.answer){
                console.info("Correct Choice: " + this.choices[i]);
                return i;  
            }                
        }
    }

    // checks if a player has answered this question and if they are the winner
    checkAnswer(answer) {
        // check if player has already answered this question return early
        if (this.answers.some(a => a.user.id === answer.user.id)) {
            console.info("Player has already answered this question " + answer.user.id);
            return true;
        } 
        
        // check if answer is correct and if no one has answered correctly yet set winner
        if (answer.isCorrect) {
            // set global winner for this question
            if (!this.answers.some(answer => answer.isCorrect)) {
                answer.setGlobalWinner();
                this.questionOwnerUserID = answer.user.id;          
                this.questionOwnerGuildID = answer.guild.id;  
                console.info(answer.user.username + " Now owns question #" + this.ID);
            } 
            // set guild winner for this question
            if (!this.answers.some(previousAnswer => previousAnswer.guild.id === answer.guild.id)) {
                answer.setGuildWinner();
                console.info(answer.user.username + " Is guild Winner for #" + this.ID + " on " + answer.guild.name);
            }
        }
        
        this.answers.push(answer);
        return false;

    }

    // Grade Results after time is up
    gradeResults(channel) {
        console.info("Grading Results on " + channel.guild.name + " in " + channel.name);

                                     
        // Check if there is a winner
        for (let i = 0; i < this.answers.length; i++) {
            // only grade answers from this guild
            if (this.answers[i].guild.id != channel.guild.id) {  
                break;
            }
            
            // grade answer based on how many people answered
            this.answers[i].gradeAnswer(this.answers.length);

            // increment times answered only if from channel guild
            this.times_answered ++;

            // increment times this question has been answered correctly
            if (this.answers[i].isCorrect) {
                this.times_answered_correctly++;
            }          
        }

        // Sort answers by points, highest to lowest
        this.answers.sort((a, b) => (a.points > b.points) ? 1 : -1);
        this.answers.reverse();
    }

    // Create question loser embed
    sendQuestionLoserEmbed(channel) {
        console.info("Creating Loser Embed");
        let loserEmbed = new EmbedBuilder()
            .setTitle('Better luck next time!')
            .addFields(
                {name: 'Answer', value: this.answer},
                {name: 'Score', value: 'no points were awarded.'}
            )
            .setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
           
            return channel.send({ embeds: [loserEmbed] });
    }


    // Create question winner embed
    sendQuestionWinnerEmbed(channel) {
        console.info("Creating Winner Embed");
        
        // Format Score String
        let scoreString = "";
        for (let i = 0; i < this.answers.length; i++) {
            
            // only grade answers from this guild
            if (this.answers[i].guild.id != channel.guild.id) {  
                break;
            }

            // 12:  username '\n'
            // 13:  username '\n'
            scoreString += this.answers[i].points + ":   " + this.answers[i].user.username + "\n";
        }

        // Get winner but only of this Guild
        const winner = this.answers.find(answer => answer.isGuildWinner && answer.guild.id === channel.guild.id);

        let winnerEmbed = new EmbedBuilder()
            .setTitle('Round over!')
            .addFields(
                {name: 'Winner', value: winner.user.username, inline: false},
                {name: 'Answer', value: this.answer, inline: false},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png')
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
           
        return channel.send({ embeds: [winnerEmbed] });
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
        this.last_asked = Sequelize.fn('datetime', 'now');
        this.times_asked++;
        const question_message = await channel.send({ embeds: [this.embed] });
        for (let i = 0; i < this.num_choices; i++) {
            // add reactions
            question_message.react(Reactions[i]);
        }
        return new Promise((resolve, reject) => {

            const timer = new Timer(this.timerSec, 1, channel, "It's time to answer!");
            timer.start().then(() => {
                // Timer Complete, Let's grade the results
                this.gradeResults(channel);

                // if channel guild has a winner send a winner embed, else send a loser embed
                if (this.answers.some(answer => answer.isGuildWinner && answer.guild.id === channel.guild.id)) {
                    this.sendQuestionWinnerEmbed(channel);
                } else {
                    this.sendQuestionLoserEmbed(channel);
                }
 
                // Store the question in the database
                this.storeQuestion();

                // Resolve the promise
                resolve("Resolved");
            });


            // Create a reaction collector
            this.client.on('messageReactionAdd', async (reaction, user) => {
                //console.info("REACTION: " + user.id + " from " + reaction.message.guild.name);
                
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
                const anAnswer = new Answer(this.ID, user, reaction, isReactionCorrect, this.difficulty, channel.guild);
                // Only one answer allowed
                if (this.checkAnswer(anAnswer)) return;
            });
        }); 
    }
}

module.exports.Question = Question;
