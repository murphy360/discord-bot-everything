
const { Answers } = require('./../../dbObjects.js');
const { Sequelize } = require('sequelize');
class Answer {

    constructor(questionId, user, isCorrect, difficulty, guild) {
        
        this.questionId = questionId;
        this.user = user;
        this.guild = guild;
        this.isCorrect = isCorrect;
        this.difficulty = difficulty;
        this.answer_date = Sequelize.fn('datetime', 'now');
        this.isGuildWinner = false;
        this.isGlobalWinner = false;
        this.points = 0;
    }

    async storeAnswerToDb() {
        
        await Answers.create({ 
            question_id: this.questionId, 
            guild_id: this.guild.id, 
            user_id: this.user.id, 
            points: this.points,
            global_winner: this.isGlobalWinner,
            guild_winner: this.isGuildWinner,
            answer_date: this.answer_date
        });
    }

    setGuildWinner() {
        this.isGuildWinner = true;
        console.info(this.user.username + ' is the ' + this.guild.name + ' guild winner for this question');
    }

    setGlobalWinner() {
        this.isGlobalWinner = true;
        console.info(this.user.username + " Now owns this question");
    }

    gradeAnswer(numPlayers) {
        console.info('gradeAnswer: ' + this.user.username + ' being graded against ' + numPlayers + ' players');
        log_string = this.user.username + ' answered in guild: ' + this.guild.name + '. ';
        if (this.isCorrect) {
            
            // Assign points based on difficulty
            const difficulty = this.difficulty.toLowerCase();
            switch (difficulty) {
                case "easy":
                    this.points = 1;
                    break;
                case "medium":
                    this.points = 2;
                    break;
                case "hard":
                    this.points = 3;
                    break;
                case "expert":
                    this.points = 4;
                    break;
                default:
                    this.points = 1;
                    break;            
            }
            log_string += ' Correct Answer, ' + this.difficulty + ' difficulty. (' + this.points + ' points). ';
        } else {
            log_string += ' Incorrect Answer. (0 points). ';
        }
        if (this.isGuildWinner) {
            log_string += ' Guild Winner: (' + 2 + ' points). ';
            this.points += 2;
        }

        if (this.isGlobalWinner) {
            log_string += ' Global Winner: (' + 3 + ' points). ';
            this.points += 3;
        }
        
        // You get more points based on the number of players in the game
        this.points = this.points * (numPlayers / 2); // 1 player x .5 points, 2 players x 1 point, 3 players x 1.5 points, 4 players x 2 points
        log_string += 'Oponent multiplier: (x' + (numPlayers / 2) + '). Total points: ' + this.points;
        console.info('gradeAnswer: ' + log_string);
    }
}
  
module.exports.Answer = Answer;