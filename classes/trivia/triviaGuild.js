const { EmbedBuilder }  = require('discord.js');
class TriviaGuild {

    GAMES_PLAYED=new Array();       // Array of all Games the player has played in
    GAMES_WON=0;                    // Number of Games won by player
    CORRECT_ANSWERS=0;              // Total number of correct answers
    WRONG_ANSWERS=0;                // Total number of incorrect answers
    WINS=0;                         // Total number of wins
    WIN_STREAK=0;                   // Number of consecutive wins

    constructor(answer) {
        this.guild = answer.guild;
        console.info("New TriviaGuild answer.user.guild.name: " + this.guild.name);
        this.DATE_JOINED = new Date();
        this.answers = new Array();
        this.players = new Array();
        this.currentScore = 0;
        this.addAnswer(answer);
        
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
        this.answers.push(answer);
        if (answer.isCorrect) {     // If answer is correct increment CORRECT_ANSWERS
            this.CORRECT_ANSWERS++;
            this.currentScore += answer.points;
        } else {                    // If answer is incorrect increment WRONG_ANSWERS
            this.WRONG_ANSWERS++;
        }
        console.info('Adding answer to guild: ' + this.guild.name + ' ' + this.currentScore);
    }

    addPlayer(player) {            // Adds a player to the player's array
        console.info('Adding player to guild: ' + this.guild.name + ' ' + player.username);
        this.players.push(player);
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
        return this.USERNAME;
    }
    
    getGuildID() {                   // Returns the Discord User ID
        return this.USER_ID;
    }

    async sendGameGuildScoreBoard() {
        console.info('sendGameGuildScore: ' + this.guild.name);
        const channel = this.guild.channels.cache.find(
            channel => channel.name.toLowerCase() === "trivia");

        const embed = this.createGameScoreboardEmbed();

        
        //console.info('There are ' + promises.length + ' intro promises'); 
        //console.info('sendGameGuildScore: ' + this.guild.name + ' ' + this.currentScore);
        //const scoreboard = new ScoreboardGame(this.client, this.hostMember, this.hostGuild, this.total_rounds, this.difficulty, this.category, this.answers, this.players, this.triviaGuilds, this.ID, channel);
        
        channel.send({ embeds: [embed] });
    }

   

    // Create question winner embed
    createGameScoreboardEmbed() {
        console.info("Creating Game Scoreboard Embed for " + this.guild.name);
        // Sort players by points
        this.players.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
        this.players.reverse();
        // Get winner
        let winner = this.players[0];

        // Format Score String
        let scoreString = "";
        for (let i = 0; i < this.players.length; i++) {
            scoreString += this.players[i].currentScore + ":   " + this.players[i].user.username + "\n";
        }
        
        console.info("Guild Score: " + this.currentScore + " Winner: " + winner.user.username);
        let embed = new EmbedBuilder()
            .setTitle(this.guild.name + ' Final Scoreboard')
            .addFields(
                //{name: 'Guild Score', value: this.currentScore, inline: false},
                {name: 'Guild Score', value: this.currentScore.toString(), inline: false},
                {name: 'Guild Winner', value: winner.user.username, inline: false},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail(this.guild.iconURL())
            .setFooter({ text: 'Question provided by The Open Trivia Database (https://opentdb.com)' });
            
        return embed;
    }
}

module.exports.TriviaGuild = TriviaGuild;
