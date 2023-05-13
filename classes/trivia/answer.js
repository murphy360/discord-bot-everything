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
    }

    storeAnswer() {
        // store or find question in database
        // if question exists, increment times_asked counter
        return 0;
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
        if (this.isCorrect) {
            // Assign points based on difficulty
            console.info('gradeAnswer: ' + this.user.username + ' answered correctly! ' + this.difficulty + ' difficulty');
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
        }
        if (this.isGuildWinner) {
            this.points += 2;
        }

        if (this.isGlobalWinner) {
            this.points += 3;
        }

        // You get more points based on the number of players in the game
        this.points = this.points * (numPlayers / 2); // 1 player x .5 points, 2 players x 1 point, 3 players x 1.5 points, 4 players x 2 points 
        
    }
}
  
module.exports.Answer = Answer;