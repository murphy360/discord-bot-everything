const { EmbedBuilder }  = require('discord.js');
const { Guilds } = require('./../../dbObjects.js');
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

    async sendGameGuildScoreBoard(winningMember, winningGuild) {
        console.info('sendGameGuildScore: ' + this.guild.name);
        const channel = this.guild.channels.cache.find(
            channel => channel.name.toLowerCase() === "trivia");

        const embed = this.createGameScoreboardEmbed(winningMember, winningGuild);

        
        //console.info('There are ' + promises.length + ' intro promises'); 
        //console.info('sendGameGuildScore: ' + this.guild.name + ' ' + this.currentScore);
        //const scoreboard = new ScoreboardGame(this.client, this.hostMember, this.hostGuild, this.total_rounds, this.difficulty, this.category, this.answers, this.players, this.triviaGuilds, this.ID, channel);
        
        channel.send({ embeds: [embed] });
        this.setGuildChampionRole();
    }

   

    // Create question winner embed
    createGameScoreboardEmbed(winningMember, winningGuild) {
        console.info("Creating Game Scoreboard Embed for " + this.guild.name);
        // Sort players by points
        this.players.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
        this.players.reverse();

        // Get Game winner
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
                {name: 'Game Winner', value: winningMember.username, inline: true},
                {name: 'Guild Winner', value: winner.user.username, inline: true},
                {name: 'Winning Guild', value: winningGuild.name, inline: true},
                { name: '\u200B', value: '\u200B' },
                {name: this.guild.name + ' Winner', value: winner.user.username, inline: true},
                {name: 'Guild Score', value: this.currentScore.toString(), inline: true},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail(winningMember.displayAvatarURL())
            .setFooter({ text: 'Wasn\'t that a fun game?' });
            
        return embed;
    }

    // set Guild Champion Role
    async setGuildChampionRole() {

        // Get Guild Champion guildMember object
        const guildChampion = await this.guild.members.fetch(this.players[0].user.id);
    
        console.info('Guild Champion: ' + guildChampion.user.username);
        const roleName = "Guild Trivia Champion";

        // Check if role exists
        let role = await this.guild.roles.cache.find(role => role.name === roleName);
        console.info('Role: ' + role);
        // Create role if it doesn't exist
        if (!role) {
            console.info('Role ' + roleName + ' Doesn\'t exist');
            role = await this.guild.roles.create({
                data: {
                    name: roleName,
                    color: '#c0c0c0' // Color: Silver
                }
            }).catch(console.error);

        } 

        // Refresh the role cache
        await this.guild.roles.fetch();
        // Make sure role is ready to go
        role = await role.edit({
            name: roleName,
            color: '#c0c0c0' // Color: Silver
        });
            
      

        if (role) {         
            // Remove role from all current champions (There can be only one!)
            const currentChampions = this.guild.members.cache.filter(member => member.roles.cache.has(role.id));
            console.info('Current Num Guild Trivia Champions: ' + currentChampions.length);
            if (!currentChampions.length > 0) {
                // No current champion so add the role to the guild champion
                console.info('No Guild Trivia Champions found');
                console.info('Adding role ' + role.name + ' to ' + guildChampion.user.username);
                guildChampion.roles.add(role.id);
                console.info('Role added ' + role.name + ' to ' + guildChampion.user.username);
            } else if (currentChampions[0].user.id === guildChampion.user.id) {
                console.info('Guild Champion is already the Guild Trivia Champion');
            } else {    
                console.info('Removing Guild Trivia Champion role from ' + currentChampions[0].user.username);
                await currentChampions.forEach(member => {
                    console.info('Removing Guild Trivia Champion role from ' + member.user.username);
                    member.roles.remove(role.id);
                });
                console.info('Adding role ' + role.name + ' to ' + guildChampion.user.username);
                guildChampion.roles.add(role.id);
                console.info('Role added ' + role.name + ' to ' + guildChampion.user.username);
            }
        } else {
            console.info(role.name + ' Role not found');
        }

    }

    async storeGuildToDb() {
        
		const DBguild = await Guilds.findOne({ where: { guild_id: this.guild.id } });
        if (DBguild) {      
            // Guild already exists in database
            console.info('Guild found in database: ' + this.guild.name);
        } else {
            // Create Guild in database
            console.info('Guild not found in database, adding now. ' + this.guild.name);
            await Guilds.create({ guild_id: this.guild.id, guild_name: this.guild.name, trivia_points_total: 0});
        } 
        const gameXP = this.getGuildsGameXP();
        console.info('Adding XP to guild: ' + this.guild.name + ' ' + gameXP);
        await Guilds.increment({
            total_xp: gameXP,
            trivia_points_total: this.currentScore
          }, {
            where: { guild_id: this.guild.id }
          });
    }

    getGuildsGameXP() {                   // Returns the XP earned in the last game 
        // Questions answered correctly * 2
        // Questions answered incorrectly * 1
        const correctAnswers = this.answers.filter(answer => answer.isCorrect);
        const incorrectAnswers = this.answers.filter(answer => !answer.isCorrect);
        const isGlobalWinner = this.answers.filter(answer => answer.isGlobalWinner);
        const isGuildWinner = this.answers.filter(answer => answer.isGuildWinner);
        const xp = (correctAnswers.length * 2) + (incorrectAnswers.length * 1) + (isGlobalWinner.length * 5) + (isGuildWinner.length * 3);
        return xp;
    }
}

module.exports.TriviaGuild = TriviaGuild;
