const Discord = require('discord.js');
const HE = require('he.js');
const COLORS = require('colors.js');

class Question {
    
    constructor(roundResult, q_num) {
        this.Q_ID;
        this.question = this.cleanText(roundResult.question);
        this.answer = this.cleanText(roundResult.correct_answer);
        this.choices = this.createChoices(roundResult.incorrect_answers);
        this.difficulty = roundResult.difficulty;
        this.category = roundResult.category;
        this.question_num = q_num;
        this.num_choices = this.choices.length;
        this.max_points = this.num_choices * 5;
        this.embed = this.createQuestionEmbed(q_num);
        this.displayed_at = null;
        this.correct_choice = this.findCorrectChoice();
    }
    
    // Create choice array
    createChoices(wrongAnswers) {
        let choice_array = new Array();
        for (let i = 0; i < answers.length; i++) {
            choice_array.push(this.cleanText(wrongAnswers[i]))
        }
        choice_array.push(this.answer)
        choice_array.sort()
        
        if (choice_array.length == 2) {
            choice_array.reverse()
        }
        
        return choice_array;
    }

    // Remove HTML Entities from text
    cleanText(dirtyText) {
        return HE.decode(dirtyText)
    }

    // Return array position of correct answer within choices
    findCorrectChoice() {
        for (let i = 0; i < this.choices.length; i++) {
            if (this.choices[i] === this.answer)
                return i;            
        }
    }

    // Create question embed
    createQuestionEmbed(question_num) {
        let theEmbed = new Discord.MessageEmbed();
            .setColor(COLORS.trivia);
            .setAuthor('Question #' + question_num);
            .setTitle(this.question);
            .addFields(
                {name: 'Choices', value: this.choices},
                {name: 'Category', value: this.category, inline: true},
                {name: 'Difficulty', vlaue: this.difficulty, inline: true}
            );
            .setThumbnail('https://webstockreview.net/images/knowledge-clipart-quiz-time-4.png');
            .setFooter('Question provided by The Open Trivia Database (https://opentdb.com)","https://opentdb.com/images/logo.png');
        
        return theEmbed;
    }
    
    // Display Question in given channel
    display(channel) {
        this.displayed_at = Date.now();
        channel.send(this.embed);
    }
}

module.exports.Question = Question;
