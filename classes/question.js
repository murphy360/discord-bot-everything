const Discord = require('discord.js');
const HE = require('he');

class Question {
    
    constructor(questionData, q_num) {
        this.question = this.cleanText(questionData.question);              // Question Text
        this.answer = this.cleanText(questionData.correct_answer);          // Answer to the Question
        this.choices = this.createChoices(questionData.incorrect_answers);  // Array of Choices (incorrect and correct answers)
        this.difficulty = questionData.difficulty;                          // Question Difficulty
        this.category = questionData.category;                              // Question Category
        this.question_num = q_num;                                          // Question Number in the Round
        this.num_choices = this.choices.length;                             // Number of Answer Choices (2 or 4)
        this.max_points = this.num_choices * 5;                             // Max Point Value
        this.embed = this.createQuestionEmbed(q_num);                       // Discord Message Embed for the Question
        this.displayed_at = null;                                           // Date/Time the Question was Displayed in the Channel
        this.correct_choice = this.findCorrectChoice();                     // Integer value indicating correct answer in Choices Array
        this.ID = this.storeQuestion();                                     // Question ID
    }
    
    storeQuestion() {
        // store of find question in database
        // if question exists, increment times_asked counter
        // return question id
    }
    
    // Create choice array
    createChoices(wrongAnswers) {
        let choice_array = new Array();
        for (let i = 0; i < wrongAnswers.length; i++) {
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
            .setColor(TRIVIA_COLOR);
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
    
    // Display Question in the given Discord channel
    display(channel) {
        this.displayed_at = Date.now();
        return channel.send(this.embed);
    }
}

module.exports.Question = Question;
