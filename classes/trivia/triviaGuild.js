const { EmbedBuilder, PermissionsBitField }  = require('discord.js');
const { Player } = require('./player.js');
const { Guilds, Answers } = require('./../../dbObjects.js');
const Sequelize = require('sequelize');
require('dotenv').config({ path: './../data/.env' });
// Names of channels to use
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;
const PLAYER_ROLE = process.env.PLAYER_ROLE;
const GUILD_CHAMPION_ROLE = process.env.GUILD_CHAMPION_ROLE;
const WORLD_CHAMPION_ROLE = process.env.WORLD_CHAMPION_ROLE;
const NOOB_ROLE = process.env.NOOB_ROLE;
const { SystemCommands } = require('./../Helpers/systemCommands.js');

// Get the channels from the guild object


class TriviaGuild {

    GAMES_PLAYED=new Array();       // Array of all Games the player has played in
    GAMES_WON=0;                    // Number of Games won by player
    CORRECT_ANSWERS=0;              // Total number of correct answers
    WRONG_ANSWERS=0;                // Total number of incorrect answers
    WINS=0;                         // Total number of wins
    WIN_STREAK=0;                   // Number of consecutive wins

    constructor(guild) {
        this.guild = guild;
        this.client = guild.client;
        this.DATE_JOINED = new Date();
        this.answers = new Array();
        this.players = new Array(); // Array of current game players in the guild
        this.allGuildPlayers = new Array(); // Array of all players in the guild
        this.currentScore = 0;
        this.triviaChannel = this.guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
        this.defaultChannel = this.guild.systemChannel;
        this.chatGPTChannel = this.guild.channels.cache.find(channel => channel.name === CHAT_GPT_CHANNEL);
        this.guildTriviaChampion = null;    // The user with the highest trivia_points_total (Member Object)
        this.isReady = false;
        this.highestScorers = null;
        this.checkGuildCriticalSetup();
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

    addAnswer(answer) {             // Adds an answer to the guild's answers array 
        this.answers.push(answer);
        if (answer.isCorrect) {     // If answer is correct increment CORRECT_ANSWERS
            this.CORRECT_ANSWERS++;
            this.currentScore += answer.points;
        } else {                    // If answer is incorrect increment WRONG_ANSWERS
            this.WRONG_ANSWERS++;
        }
        answer.storeAnswerToDb();   // Store the answer in the database
    }

    async addPlayer(player) {            // Adds a player to the player's array
        this.players.push(player);
        await this.setPlayerGuildRole(player.user); // Send the user object from the player object to setPlayerGuildRole
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

    async sendGameGuildScoreBoard(winningUser, winningGuild) {  
        if (this.isReady) {
            const embed = this.createGameScoreboardEmbed(winningUser, winningGuild);
            this.triviaChannel.send({ embeds: [embed] });
            this.setGuildChampionRole();
        } else {
            console.log('triviaGuild.js: sendGameGuildScoreBoard: Guild not ready: ' + this.guild.name);
        } 
    }

    // Create question winner embed
    createGameScoreboardEmbed(worldChampionUser, winningGuild) {

        let winner = null;
        let guildWinnerString = "No Guild Winner";
        let scoreString = "No Scores";

        if (this.players.length > 0) {
            // Sort players by points
            this.players.sort((a, b) => (a.currentScore > b.currentScore) ? 1 : -1);
            this.players.reverse();

            // Get Game winner
            winner = this.players[0];
            guildWinnerString = winner.user.username;
            scoreString = "";
            
            // Format Score String
            for (let i = 0; i < this.players.length; i++) {
                scoreString += this.players[i].currentScore + ":   " + this.players[i].user.username + "\n";
            }
        }
        
        let embed = new EmbedBuilder()
            .setTitle(this.guild.name + ' Final Scoreboard')
            .addFields(
                {name: 'Game Winner', value: worldChampionUser.username, inline: true},
                {name: 'Winning Guild', value: winningGuild.name, inline: true},
                {name: '\u200B', value: '\u200B'},
                {name: this.guild.name + ' Winner', value: guildWinnerString, inline: true},
                {name: 'Guild Score', value: this.currentScore.toString(), inline: true},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail(worldChampionUser.displayAvatarURL())
            .setFooter({ text: 'Wasn\'t that a fun game?' });  
        return embed;
    }

    // Find the Guild Champion
    async setGuildChampion() {

        await this.setGuildHighScores();
        
        if (this.highestScorers.length > 0) {
            this.guildTriviaChampion = await this.guild.members.fetch(this.highestScorers[0].dataValues.user_id);
        } else {
            console.info('triviaGuild.js: ' + this.guild.name + ': No Guild Champion found');
            return;
        }
    
        console.info("triviaGuild.js: Printing Guild Champion " + this.guildTriviaChampion.user.username);
        return this.guildTriviaChampion;
    }

    // set Guild Champion Role
    async setGuildChampionRole() {
        const helper = new SystemCommands(this.client);
        // Get Guild Champion guildMember object
        await this.setGuildChampion();
                
        // Create role if it doesn't exist
        if (!await helper.createGuildRoles(this.guild)) {
            console.info('triviaGuild.js: ' + this.guild.name + ': ' + GUILD_CHAMPION_ROLE + ' Role does not exist in ' + this.guild.name + ' guild and cannot be created' );
            return;
        } 
        
        let guildChampRole = await this.guild.roles.cache.find(role => role.name === GUILD_CHAMPION_ROLE);

        if (guildChampRole) {      
            console.info(this.guild.name + ': ' + guildChampRole.name + ' Role found - Now checking for current champions');
            const currentChampions = await guildChampRole.members.map(member => member);
            if (!currentChampions.length > 0) {
                // No current champion so add the role to the guild champion
                this.guildTriviaChampion.roles.add(guildChampRole.id);
            } else if (currentChampions.length === 1 && currentChampions[0].user.id === this.guildTriviaChampion.user.id) {
                console.info(this.guild.name + ': Guild Champion is already the Guild Trivia Champion');
            } else {   
                console.info(this.guild.name + ': Guild Champion is not the Guild Trivia Champion, removing role from current champions and adding to new champion'); 
                for (const member of currentChampions) {
                    await this.removeRole(member, guildChampRole.name);
                  }
                await this.guildTriviaChampion.roles.add(guildChampRole.id);
            }
        } else {
            console.info(this.guild.name + ': ' + GUILD_CHAMPION_ROLE + ' Role not found');
        }
    }

    async setPlayerGuildRole(user) {
        const helper = new SystemCommands(this.client);

        // Get Guild Champion guildMember object
        const guildMember = await this.guild.members.fetch(user.id);

        // Check the Guild has Roles
        if (!helper.createGuildRoles(this.guild)) {
            console.info('triviaGuild.js: ' + this.guild.name + ': ' + PLAYER_ROLE + ' Role does not exist in ' + guild.name + ' guild and cannot be created' );
            return;
        // Role exists && Member has role so do nothing    
        } 
        let playerRole = await this.guild.roles.cache.find(role => role.name === PLAYER_ROLE);
        if (!playerRole) {
            console.info('triviaGuild.js: ' + this.guild.name + ': ' + PLAYER_ROLE + ' Role not found');
            return;
        }
        
        if (guildMember.roles.cache.has(playerRole.id)) {
            console.info(this.guild.name + ': Member ' + guildMember.user.username + ' already has role ' + PLAYER_ROLE);
            return;
        } else {
            await guildMember.roles.add(playerRole.id);
            await this.triviaChannel.send(`Level Up! ${guildMember.user.username}, You are now a Player!`);
            this.removeRole(guildMember, NOOB_ROLE);
        }
    }

    // remove the Noob role from the member
    async removeRole(guildMember, roleName) {   
        const role = await this.guild.roles.cache.find(role => role.name === roleName);
        if (role) {
            if (guildMember.roles.cache.has(role.id)) {
                guildMember.roles.remove(role.id);
                return;
            }
        }
    }

    async storeGuildToDb() {
        
		const DBguild = await Guilds.findOne({ where: { guild_id: this.guild.id } });
        if (DBguild) {      
            // Guild already exists in database
        } else {
            // Create Guild in database
            await Guilds.create({ guild_id: this.guild.id, guild_name: this.guild.name, trivia_points_total: 0});
        } 
        const gameXP = this.getGuildsGameXP();
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

     // Find the top 10 highest scoring players in the guild
     async setGuildHighScores() {
        
        console.info('triviaGuild.js: findGuildHighScores: ' + this.guild.name + ': Finding highest scorers');
        this.highestScorers = await Answers.findAll({
            attributes: [
                'user_id',
                [Sequelize.fn('sum', Sequelize.col('points')), 'total_points'],
            ],
            where: {
                guild_id: this.guild.id,
            },
            group: ['user_id'],
            order: [[Sequelize.fn('sum', Sequelize.col('points')), 'DESC']],
        });

        
        // Check all highest scorers are members of the guild
        for (let i = 0; i < this.highestScorers.length; i++) {
            const guildMember = await this.guild.members.fetch(this.highestScorers[i].dataValues.user_id);
            if (!guildMember) {
                console.info('triviaGuild.js: ' + this.guild.name + ': User ID not a member - ' + this.highestScorers[i].dataValues.user_id);
                this.highestScorers.splice(i, 1); // Remove the user from the array
                i--;
            }
        }

        // Check if there are any highest scorers left
        if (this.highestScorers.length < 1) {
            console.info('triviaGuild.js: ' + this.guild.name + ': No highest scorers found');
            return;
        }

        const highestScore = this.highestScorers[0].dataValues.total_points;
        const tiedHighestScorers = this.highestScorers.filter((scorer) => scorer.dataValues.total_points === highestScore);
        
        // We have a tie for top score 
        if (tiedHighestScorers.length > 1) {
            console.info('triviaGuild.js: ' + this.guild.name + ': Tie for top score'); 
            const tiedHighestScorerIds = tiedHighestScorers.map((scorer) => scorer.dataValues.user_id);
            const highestXpUser = await Users.findOne({
            where: {
                id: {
                [Sequelize.Op.in]: tiedHighestScorerIds,
                },
            },
            order: [['total_xp', 'DESC']],
            });
            
            // Move the highest xp user to the top of the highestScorers array
            for (let i = 0; i < this.highestScorers.length; i++) {
                if (this.highestScorers[i].dataValues.user_id === highestXpUser.id) {
                    this.highestScorers.splice(0, 0, this.highestScorers.splice(i, 1)[0]);
                    break;
                }
            }
        }
    }

    async checkGuildCriticalSetup() {
        const helper = new SystemCommands(this.client);
        const contextData = await helper.checkGuildCriticalSetup(this.guild);
        if (contextData.length == 0) {
            this.isReady = true;
        }
    }
}

module.exports.TriviaGuild = TriviaGuild;
