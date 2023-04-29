class Answer {

    constructor(questionId, user, reaction, isCorrect, difficulty, guild) {
        
        this.questionId = questionId;
        this.user = user;
        this.guild = guild;
        this.reaction = reaction;
        this.isCorrect = isCorrect;
        this.difficulty = difficulty;
        this.answer_date = Date.now();
        this.isGuildWinner = false;
        this.isGlobalWinner = false;
        this.points = 0;
        this.gradeAnswer();

    }

    storeAnswer() {
        // store or find question in database
        // if question exists, increment times_asked counter
        return 0;
    }

    setGuildWinner() {
        console.info('setGuildWinner: ' + this.user.username + ' is the guild winner! ' + this.guild.name);
        this.isGuildWinner = true;
        this.gradeAnswer();
    }

    setGlobalWinner() {
        this.isGlobalWinner = true;
        this.gradeAnswer();
    }

    gradeAnswer() {
        if (this.isCorrect) {
            // Assign points based on difficulty
            switch (this.difficulty) {
                case "easy":
                    this.points = 1;
                    break;
                case "medium":
                    this.points = 2;
                    break;
                case "hard":
                    this.points = 3;
                    break;
                default:
                    this.points = 0;
                    break;
            }
        }
        if (this.isGuildWinner) {
            this.points += 5;
        }

        if (this.isGlobalWinner) {
            this.points += 10;
        }
    }
}
  
module.exports.Answer = Answer;