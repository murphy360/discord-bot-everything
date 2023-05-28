const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle }  = require('discord.js');
const HE = require('he');
const { Sequelize } = require('sequelize');
const { Questions } = require('./../../dbObjects.js');
const { Answer } = require('./answer.js');
const { Timer } = require('../common/timer.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');

const Reactions = [
    '\u0031\u20E3',     // :one: 
    '\u0032\u20E3',     // :two:
    '\u0033\u20E3',     // :three:
    '\u0034\u20E3',     // :four:
    '👎'                // :thumbsdown: 
];    

class Question {
    
    constructor(client, questionData, questionNumber, source, sourceUrl) {
        console.info('Question.constructor(): ' + source + ' USL: ' + sourceUrl);
        this.timerSec = 30;                                                     // Time to answer the question
        this.answers = new Array();                                             // Array of Answers
        this.chatGPTClient = new ChatGPTClient();
        this.ID = null;                                                         // Question ID
        this.client = client; 
        this.source = source;                                                   // bot/client
        this.sourceUrl = sourceUrl;                                             // URL of the source
        this.difficulty = questionData.difficulty;                              // Question Difficulty
        this.category = questionData.category;                                  // Question Category
        this.question_num = questionNumber;                                     // Question Number in the Round 
        this.dislikes = 0;                                                      // Number of Dislikes
        if (this.source == 'The Open Trivia Database') {
            this.question = this.cleanText(questionData.question);              // Question Text
            this.answer = this.cleanText(questionData.correct_answer);          // Answer to the Question
            this.questionType = this.cleanText(questionData.type);              // Question Type
        } else {
            this.question = questionData.question;                              // Question Text
            this.answer = questionData.correct_answer                           // Answer to the Question
            this.choices = questionData.incorrect_answers                       // Array of Choices (incorrect and correct answers)
            this.questionType = questionData.type                               // Question Type
        }
        this.choices = this.createChoices(questionData.incorrect_answers);      // Array of Choices (incorrect and correct answers)
        this.correct_choice = this.findCorrectChoice();                         // Integer value indicating correct answer in Choices Array
        this.incorrect_choices = questionData.incorrect_answers;                // Array of Incorrect Answers
        this.num_choices = this.choices.length;                                 // Number of Answer Choices (2 or 4)
        this.max_points = this.num_choices * 5;                                 // Max Point Value
        this.last_asked = null;                                                 // Date/Time the Question was Displayed in the Channel
        this.createQuestionEmbed();                                             // Discord Message Embed for the Question
        this.owner = null;                                                      // User who added the question to the database
        this.questionOwnerUserID = null;                                        // Player who answered the question correctly first
        this.questionOwnerGuildID = null;                                       // Guild where the question was answered correctly first
        this.sourceID = null;                                                   // ID of the question from the source
        this.times_asked = 0;                                                   // Number of times the question has been asked
        this.times_answered = 0;                                                // Number of times the question has been answered
        this.times_answered_correctly = 0;                                      // Number of times the question has been answered correctly
        this.syncQuestion();                                                    // Sync the question with the database
        
    }

    async syncQuestion() {
        const DBquestion = Questions.findOne({ where: { question: this.question } });
        if (DBquestion.question == this.question) {
            console.info("Question.syncQuestion() - Question exists in the database, syncing it");
            this.ID = DBquestion.question_id;
            this.questionOwnerUserID = DBquestion.question_owner_user_id;
            this.questionOwnerGuildID = DBquestion.question_owner_guild_id;
            this.last_asked = DBquestion.last_asked;
            this.times_asked = DBquestion.times_asked;
            this.times_answered = DBquestion.times_answered;
            this.dislikes = DBquestion.dislikes;
        } 
        //this.questionUrl = await this.chatGPTClient.getImageUrl(this.question);          // URL of the image for the question

        this.storeQuestion();
       
    }

    async storeQuestion() {
        let DBquestion = await Questions.findOne({ where: { question: this.question } });
        if (!DBquestion || this.question != DBquestion.question) {      // If the question doesn't exist in the database, create it
            console.info("Question.storeQuestion() - Question doesn't exist in the database, creating it");
            DBquestion = await Questions.create({ 
                question_text: this.question,
                source: this.source,
                source_url: this.sourceUrl,
                source_id: this.sourceID,
                question_url: this.questionUrl,
                question_type: this.questionType,
                category: this.category,
                dislikes: this.dislikes,
                difficulty: this.difficulty,
                question: this.question,
                correct_answer: this.answer,
                answer2: this.incorrect_choices[0],
                answer3: this.incorrect_choices[1],
                answer4: this.incorrect_choices[2],
                times_asked: this.times_asked,
                times_answered: this.times_answered,
                times_answered_correctly: this.times_answered_correctly,
                last_asked: this.last_asked,
                owner_guild_id: this.questionOwnerGuildID,
                owner_user_id: this.questionOwnerUserID,
            });
        } else { 
            console.info("Question.storeQuestion() - Question exists in the database, updating it");
            DBquestion.update({ 
                question_text: this.question,
                source: this.source,
                source_id: this.sourceID,
                question_url: this.questionUrl,
                question_type: this.questionType,
                category: this.category,
                dislikes: this.dislikes,
                difficulty: this.difficulty,
                question: this.question,
                correct_answer: this.answer,
                answer2: this.incorrect_choices[0],
                answer3: this.incorrect_choices[1],
                answer4: this.incorrect_choices[2],
                times_asked: this.times_asked,
                times_answered: this.times_answered,
                times_answered_correctly: this.times_answered_correctly,
                last_asked: this.last_asked,
                owner_guild_id: this.questionOwnerGuildID,
                owner_user_id: this.questionOwnerUserID,
            });
        }
        this.ID = DBquestion.question_id;
    }
    
    // Create choice array
    createChoices(wrongAnswers) {
        let choice_array = new Array();
        
        for (let i = 0; i < wrongAnswers.length; i++) {
            console.info("Wrong Answer: " + wrongAnswers[i] + " " + this.source);
            if (this.source == 'opentdb') {
                choice_array.push(this.cleanText(wrongAnswers[i]));
            } else {
                choice_array.push(wrongAnswers[i]);
            }
            
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
        console.info("Cleaning Text: " + dirtyText);
        const cleanText = HE.decode(dirtyText);
        console.info("Cleaned Text: " + cleanText);
        return cleanText;
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
            console.info(answer.user.username + " has already answered this question");
            return false;
        } 
        
        // check if answer is correct and if no one has answered correctly yet set winner
        if (answer.isCorrect) {
            
            console.info(answer.user.username + " has answered correctly");
            // set global winner for this question
            if (!this.answers.some(answer => answer.isGlobalWinner)) {
                answer.setGlobalWinner();
                this.questionOwnerUserID = answer.user.id;          
                this.questionOwnerGuildID = answer.guild.id;  
                
            } 
            // set guild winner for this question
            console.info("Checking if " + answer.user.username + " is the first to answer correctly in this guild");
            console.info("Previous Answers: " + this.answers.length);
            console.info("Previous Answers Have guildWinner?: " + this.answers.some(previousAnswer => !previousAnswer.isGuildWinner));
            console.info("Previous Answers from this guild?: " + this.answers.some(previousAnswer => previousAnswer.guild.id != answer.guild.id));
            console.info("NAND: " + (this.answers.some(previousAnswer => !previousAnswer.isGuildWinner && previousAnswer.guild.id != answer.guild.id)));
            const answersWithGuildWinner = this.answers.filter(previousAnswer => previousAnswer.isGuildWinner);
            const answersFromThisGuild = answersWithGuildWinner.filter(previousAnswer => previousAnswer.guild.id == answer.guild.id);
            if (answersFromThisGuild.length == 0) {
                answer.setGuildWinner();
            }
        
        } else {
            console.info(answer.user.username + " has answered incorrectly");
        }
        
        this.answers.push(answer);
        console.info("Added an Answer: " + this.answers.length);
        return true;

    }

    // Grade Results after time is up
    gradeResults(channel) {
        console.info("Grading Results on " + channel.guild.name + " in " + channel.name + ' number of answers: ' + this.answers.length);

                                     
        // Check if there is a winner
        for (let i = 0; i < this.answers.length; i++) {
            // only grade answers from this guild
            if (this.answers[i].guild.id != channel.guild.id) {  
                console.info("Answer " + this.answers[i].user.username + " is not from this guild, skipping");
                continue; // skip this answer
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
            .setFooter({ text: 'Question provided by ' + this.source + ' ' + this.sourceURL });
           
            return channel.send({ embeds: [loserEmbed] });
    }


    // Create question winner embed
    sendQuestionWinnerEmbed(channel) {
        console.info("Creating Winner Embed");
        
        // Format Score String
        let scoreString = "";
        for (let i = 0; i < this.answers.length; i++) {
            console.info("Answer: " + this.answers[i].user.username + " " + this.answers[i].points);
            // only grade answers from this guild
            if (this.answers[i].guild.id != channel.guild.id) {  
                console.info("Answer not from this guild");
                
            } else {
                // 12:  username '\n'
                // 13:  username '\n'
                scoreString += this.answers[i].points + ":   " + this.answers[i].user.username + "\n";
            }           
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
            .setFooter({ text: 'Question provided by ' + this.source + ' ' + this.sourceURL });
           
        return channel.send({ embeds: [winnerEmbed] });
    }


    // Create question embed
    async createQuestionEmbed() {

        const questionNumberString = 'Question # ' + this.question_num;
        
        console.info("Creating Question Embed");
        this.embed = new EmbedBuilder()
            .setDescription(questionNumberString)
            // Set the title of the field
            .setTitle(this.question)
            // Set the color of the embed
            .setColor(TRIVIA_COLOR)
            // Set the main content of the embed
            .setThumbnail(this.questionUrl)
            .addFields(
                {name: 'Choices', value: this.formatChoices(), inline: false},
                {name: 'Category', value: this.category, inline: true},
                {name: 'Difficulty', value: this.difficulty, inline: true}
            )
            // Add originGuild icon to embedd
            //.setThumbnail(this.hostGuild.iconURL())
            .setTimestamp()
            .setFooter({ text: 'Question provided by ' + this.source + ' ' + this.sourceUrl });
        return this.embed;
    }

    createQuestionActionRow() {
        this.buttons = [];

        for (let i = 0; i < this.choices.length; i++) {
            let id = i + 1;
            id = id.toString();

            if (this.choices[i] === 'True' || this.choices[i] === 'False') {
                this.buttons.push(
                    new ButtonBuilder()
                    .setCustomId(id)
                    .setLabel(this.choices[i])
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false)
                );
                
            } else {
                const label = id;
                this.buttons.push(
                    new ButtonBuilder()
                    .setCustomId(id)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false)
                );
            }
        }
        this.row = new ActionRowBuilder()
			.addComponents(this.buttons);
        return this.row;
    }


    
    
    // Display Question in the given Discord channel
    async ask(channel) {
        console.info("Asking question: " + this.question + " Correct Choice: " + this.correct_choice + " in " + channel.guild.name + " in " + channel.name);
        // set max listeners to 8 times the number of guilds in the client
        const numGuilds = this.client.guilds.cache.size;
        this.client.setMaxListeners(numGuilds * 8); 
        this.last_asked = Sequelize.fn('datetime', 'now');
        this.times_asked++;
        const actionRow = this.createQuestionActionRow();
        const question_message = await channel.send({ embeds: [this.embed], components: [actionRow] });

        question_message.react(Reactions[4]); // add the thumbs down reaction
        return new Promise((resolve, reject) => {

            const timer = new Timer(this.timerSec, 1, channel, "It's time to answer!");
            timer.start().then(() => {

                
                console.info(question_message.components[0]);

                this.buttons.forEach((button) => {
                    console.info(button);
                    console.info(button.type);
                    button.setDisabled(true);
                });
               
               

                question_message.edit({ components: [question_message.components[0]] });
                // Timer Complete, Let's grade the results
                this.gradeResults(channel);
                
                //.components[0].setDisabled(1);
                //question_message.edit({ components: [message.components[0]] });
            

                // if channel guild has a winner send a winner embed, else send a loser embed
                if (this.answers.some(answer => answer.isGuildWinner && answer.guild.id === channel.guild.id)) {
                    this.sendQuestionWinnerEmbed(channel);
                } else {
                    this.sendQuestionLoserEmbed(channel);
                }
 
                // Store the question in the database
                this.storeQuestion();

                // Remove the event listener
                //this.client.removeListener('messageReactionAdd', handleReaction);
                
        
                console.info("client max listeners = " + this.client.getMaxListeners());
                console.info("client current messageReactionAdd listeners = " + this.client.listenerCount('messageReactionAdd'));

                // Resolve the promise
                resolve("Resolved");
            });

            // Create Button Collector
            const timerSecMilli = this.timerSec * 1000;
            
            // should definitely increase the time in your collector.
            const collector = channel.createMessageComponentCollector({ time: timerSecMilli }); 

            collector.on('collect', async i => {
                // check if the author triggered the interaction
                console.info("COLLECT: " + i.user.username + " from " + i.guild.name + " " + i.customId);

                // If timer is inactive, return early
                if (!timer.isActive) {
                    i.deferUpdate();
                    return;
                }
                // Check if the reaction is from a player (not the bot)
                if (i.user.id === this.client.user.id) return;

                // Convert i.customId to a number
                const responseNum = parseInt(i.customId) - 1;

                console.info("Response Number: " + responseNum + " Correct Choice: " + this.correct_choice);

                // Check if the reaction is a correct choice
                const isReactionCorrect = responseNum === this.correct_choice; 
                // A new Answer needs to be checked if this user has already answered
                const anAnswer = new Answer(this.ID, i.user, isReactionCorrect, this.difficulty, channel.guild);
                // Only one answer allowed
                if (this.checkAnswer(anAnswer)) {
                    console.info("Adding Answer: " + anAnswer.user.username + " to Question: " + this.question + " " + anAnswer.isCorrect + " " + responseNum);
                } else { 
                    console.info("Answer already exists for: " + anAnswer.user.username + " to Question: " + this.question + " " + anAnswer.isCorrect + " " + responseNum);
                }
                // defer the interaction
                await i.deferUpdate();
            });


            // Create a reaction collector
            this.client.on('messageReactionAdd', async (reaction, user) => {
                //console.info("REACTION: " + user.username + " from " + reaction.message.guild.name);
                
                // If timer is inactive, return early
                if (!timer.isActive) return;
                
                // Check if the reaction is on the correct message
                if (reaction.message.id !== question_message.id) return;
    
                // Check if the reaction is from a bot. If so, return early
                if (user.id === this.client.user.id) return;
    
                let responseNum = "";
    
                // Check which reaction was added
                switch (reaction.emoji.name) {
                    case '👎':              // :ThumbsDown:
                        responseNum = 4;
                        break;
                    default:
                        // Handle other reactions
                        break;
                }
                if (responseNum === 4) {
                    this.dislikes++;
                } 
            });
        }); 
    }
}

module.exports.Question = Question;
