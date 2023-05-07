const { Users } = require('./../../dbObjects.js');
class Player {

    GAMES_PLAYED=new Array();       // Array of all Games the player has played in
    GAMES_WON=0;                    // Number of Games won by player
    CORRECT_ANSWERS=0;              // Total number of correct answers
    WRONG_ANSWERS=0;                // Total number of incorrect answers
    WINS=0;                         // Total number of wins
    WIN_STREAK=0;                   // Number of consecutive wins

    constructor(answer) {
        console.info('Creating new player: ' + answer.user.username);
        this.user = answer.user;
        this.DATE_JOINED = new Date();
        this.answers = new Array();
        this.currentScore = 0;
        this.addAnswer(answer);
        this.storePlayerToDb();
    }

    async storePlayerToDb() {
        
		const DBuser = await Users.findOne({ where: { user_id: this.user.id } });
        if (DBuser) {
            console.info('User found in database: ' + this.user.username);
        } else {
            console.info('User not found in database, adding now. ' + this.user.username);
            await Users.create({ user_id: this.user.id, user_name: this.user.username });
        }
    }
    
    getStreak() {                   // Return the player's win streak
        return this.WIN_STREAK;
    }
    
    getWinPercentage() {            // Return Win Percentage rounded to the nearest whole number
        return Math.round((this.GAMES_WON/this.GAMES_PLAYED.length)*100);
    }
    
    getCorrectAnswerPercentage() {  // Return Percentage of Correct Answers rounded to the nearest whole number
        return Math.round((this.CORRECT_ANSWERS / (this.CORRECT_ANSWERS + this.WRONG_ANSWERS))*100);
    }
    
    addGame(last_game, did_win) {   // Adds a new game to the GAMES_PLAYED array
        this.GAMES_PLAYED[this.GAMES_PLAYED.length]=last_game
        if (did_win) {              // If player won increment GAMES_WON and WIN_STREAK
            this.GAMES_WON++;
            this.WIN_STREAK++;
        } else {                    // If player lost reset WIN_STREAK;
            this.WIN_STREAK=0;
        }
    }

    addAnswer(answer) {             // Adds an answer to the player's answers array 
        console.info('Adding answer to player: ' + this.user.username + ' ' + this.currentScore);
        this.answers.push(answer);
        if (answer.isCorrect) {     // If answer is correct increment CORRECT_ANSWERS
            this.CORRECT_ANSWERS++;
            this.currentScore += answer.points;
        } else {                    // If answer is incorrect increment WRONG_ANSWERS
            this.WRONG_ANSWERS++;
        }
        console.info('Adding answer to player: ' + this.user.username + ' ' + this.currentScore);
    }
    
    getDateJoined() {               // Returns a Date Object of the player join Date
        return this.DATE_JOINED;
    }
    
    getTimePlaying() {              // Returns length of time since the plaer was created
        now=new Date();
        return now-this.DATE_JOINED;
    }
    
    getNumberGamesPlayed() {        // Returns the number of Games Played by player
        return this.GAMES_PLAYED.length;
    }
    
    getGames() {                    // Returns an Array of Games Played
        return this.GAMES_PLAYED;
    }
    
    getUsername() {                 // Returns string containing Player's Discord username
        return this.userNAME;
    }
    
    getUserID() {                   // Returns the Discord User ID
        return this.user_ID;
    }
}

module.exports.Player = Player;
