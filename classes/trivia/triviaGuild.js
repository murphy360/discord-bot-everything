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
const { systemCommands } = require('./../Helpers/systemCommands.js');

// Get the channels from the guild object


class TriviaGuild {

    GAMES_PLAYED=new Array();       // Array of all Games the player has played in
    GAMES_WON=0;                    // Number of Games won by player
    CORRECT_ANSWERS=0;              // Total number of correct answers
    WRONG_ANSWERS=0;                // Total number of incorrect answers
    WINS=0;                         // Total number of wins
    WIN_STREAK=0;                   // Number of consecutive wins

    constructor(answer) {
        this.guild = answer.guild;
        this.DATE_JOINED = new Date();
        this.answers = new Array();
        this.players = new Array(); // Array of current game players in the guild
        this.allGuildPlayers = new Array(); // Array of all players in the guild
        this.currentScore = 0;
        this.addAnswer(answer);
        this.triviaChannel = this.guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
        this.defaultChannel = this.guild.systemChannel;
        this.chatGPTChannel = this.guild.channels.cache.find(channel => channel.name === CHAT_GPT_CHANNEL);
        
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

    async sendGameGuildScoreBoard(worldChampionUser, winningGuild) {
        const channel = this.guild.channels.cache.find(
            channel => channel.name.toLowerCase() === TRIVIA_CHANNEL);
        const embed = this.createGameScoreboardEmbed(worldChampionUser, winningGuild);
        if (channel) {
            channel.send({ embeds: [embed] });
            this.setGuildChampionRole(worldChampionUser);
        } else {
            console.log('triviaGuild.js: Channel Does Not Exist in ' + this.guild.name);
        }
        
    }

    // Create question winner embed
    createGameScoreboardEmbed(worldChampionUser, winningGuild) {
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
        let embed = new EmbedBuilder()
            .setTitle(this.guild.name + ' Final Scoreboard')
            .addFields(
                {name: 'Game Winner', value: worldChampionUser.username, inline: true},
                {name: 'Guild Winner', value: winner.user.username, inline: true},
                {name: 'Winning Guild', value: winningGuild.name, inline: true},
                {name: '\u200B', value: '\u200B'},
                {name: this.guild.name + ' Winner', value: winner.user.username, inline: true},
                {name: 'Guild Score', value: this.currentScore.toString(), inline: true},
                {name: 'Scores', value: scoreString, inline: false}
            )
            .setThumbnail(worldChampionUser.displayAvatarURL())
            .setFooter({ text: 'Wasn\'t that a fun game?' });  
        return embed;
    }

    // Find the Guild Champion
    async findGuildChampion(worldChampionUser) {

        let highestScorers = await Answers.findAll({
            attributes: [
                'user_id',
                [Sequelize.fn('sum', Sequelize.col('points')), 'total_points'],
            ],
            where: {
                guild_id: this.guild.id,
            },
            group: ['user_id'],
            order: [[Sequelize.fn('sum', Sequelize.col('points')), 'DESC']],
            limit: 10,
        });
            
        // Set the Guild Champion as the member with highest points
        let guildChampion = await this.guild.members.fetch(highestScorers[0].dataValues.user_id); 

        // If there's only one Player in the guild, they are the Guild Champion (and maybe the World Champion, too)
        if (highestScorers.length == 1) {
            console.info(this.guild.name + ': Only one player in guild - Guild Champion found - ' + guildChampion.user.username);
            return guildChampion;
        } 

        if (worldChampionUser.id == guildChampion.user.id ) {
            console.info(this.guild.name + ': Guild Champion found - ' + guildChampion.user.username + ' is the World Champion');
            console.info('Next Highest Scorer ID: ' + highestScorers[1].dataValues.user_id);
            guildChampion = await this.guild.members.fetch(highestScorers[1].dataValues.user_id);
            console.info(this.guild.name + ': Guild Champion found - ' + guildChampion.user.username);
            // remove first player from array
            highestScorers.shift(); 
        } 

        const highestScore = highestScorers[0].dataValues.total_points;
        const tiedHighestScorers = highestScorers.filter((scorer) => scorer.dataValues.total_points === highestScore);
        
        // We have a tie for top score 
        if (tiedHighestScorers.length > 1) {

            const tiedHighestScorerIds = tiedHighestScorers.map((scorer) => scorer.dataValues.user_id);
            const highestXpUser = await Users.findOne({
            where: {
                id: {
                [Sequelize.Op.in]: tiedHighestScorerIds,
                },
            },
            order: [['total_xp', 'DESC']],
            });
            guildChampion = await this.guild.members.fetch(highestXpUser.user_id);
        }
                      
        console.info("Printing Guild Champion " + guildChampion.user.username + " " + guildChampion.user.id + " " + guildChampion.user.displayAvatarURL());
        return guildChampion;
    }

    // set Guild Champion Role
    async setGuildChampionRole(worldChampionUser) {

        // Get Guild Champion guildMember object
        const guildChampion = await this.findGuildChampion(worldChampionUser);
                
        // Check if role exists
        let guildChampRole = await this.guild.roles.cache.find(role => role.name === GUILD_CHAMPION_ROLE);

        // Create role if it doesn't exist
        if (!guildChampRole) {
            const helper = new systemCommands();
            await helper.createGuildRoles(guild);
        } 

        if (guildChampRole) {      
            console.info(this.guild.name + ': ' + guildChampRole.name + ' Role found - Now checking for current champions');
            const currentChampions = await guildChampRole.members.map(member => member);
            if (!currentChampions.length > 0) {
                // No current champion so add the role to the guild champion
                guildChampion.roles.add(guildChampRole.id);
            } else if (currentChampions.length === 1 && currentChampions[0].user.id === guildChampion.user.id) {
                console.info(this.guild.name + ': Guild Champion is already the Guild Trivia Champion');
            } else {   
                console.info(this.guild.name + ': Guild Champion is not the Guild Trivia Champion, removing role from current champions and adding to new champion'); 
                for (const member of currentChampions) {
                    await this.removeRole(member, guildChampRole.name);
                  }
                await guildChampion.roles.add(guildChampRole.id);
            }
        } else {
            console.info(this.guild.name + ': ' + GUILD_CHAMPION_ROLE + ' Role not found');
        }
    }

    async createGuildRole(roleName) {

        return new Promise(async (resolve, reject) => {

            
            // Create Player role
            await this.guild.roles.create({
                name: roleName,
                color: '#00ff00', // Green
                hoist: true,
                position: 105,
            }).then(async role => {
                // TODO add some cool permissions
                /*
                await this.triviaChannel.permissionOverwrites.set([
                    {
                    id: role.id,
                    allow: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AddReactions,
                        PermissionsBitField.Flags.CreatePrivateThreads],
                    }
                ]);

                
                await this.chatGPTChannel.permissionOverwrites.set([
                    {
                    id: role.id,
                    allow: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AddReactions,
                        PermissionsBitField.Flags.CreatePrivateThreads],
                    }
                ]);

                
                await this.defaultChannel.permissionOverwrites.set([
                    {
                    id: role.id,
                    allow: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AddReactions,
                        PermissionsBitField.Flags.CreatePrivateThreads],
                    }
                ]);*/
                resolve(role);
            }).catch(console.error); 
        });
    }

    async setPlayerGuildRole(user) {
        const roleName = "Player";
        

        // Get Guild Champion guildMember object
        const guildMember = await this.guild.members.fetch(user.id);

        // Check if role exists
        let playerRole = await this.guild.roles.cache.find(role => role.name === roleName);
        


        // Create role if it doesn't exist
        if (!playerRole) {
             await this.createGuildRole(roleName).then(role => {
                playerRole = role;
             }).catch(console.error);
             
            
        // Role exists && Member has role so do nothing    
        } else if (guildMember.roles.cache.has(playerRole.id)) {
            console.info(this.guild.name + ': Member ' + guildMember.user.username + ' already has role ' + playerRole.name);
            return;
        } 
        
        // Role exists && Member doesn't have role so add it (And remove Noob role)
        // Add the role to the the Player
        await guildMember.roles.add(playerRole.id);
        await this.triviaChannel.send(`Level Up! ${guildMember.user.username}, You are now a Player!`);
        this.removeRole(guildMember, 'Noob');
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
     async findGuildHighScores() {
        
        console.info('findGuildHighScores');
        let highestScorers = await Answers.findAll({
            attributes: [
              'user_id',
              [Sequelize.fn('sum', Sequelize.col('points')), 'total_points'],
            ],
            where: {
              guild_id: guild.id,
            },
            group: ['user_id'],
            order: [[Sequelize.fn('sum', Sequelize.col('points')), 'DESC']],
            limit: 10,
          });



        
        if (this.highestScorers.length === 1) {
            console.info('Highest Score: ' + this.highestScorers[0].dataValues.total_points);
            this.guildTriviaChampion = await this.client.users.cache.get(this.highestScorers[0].dataValues.user_id);
        } else if (this.highestScorers.length > 1) {
            console.info('More than one score found');
            
            
            if (this.highestScorers[0].dataValues.total_points === this.highestScorers[1].dataValues.total_points) {
                console.info('Tie for top score - Currently Unhandled'); // TODO Handle ties for top score
                // TODO Figure our ties
            } else {
                console.info('No tie for top score');
            }
            this.guildTriviaChampion = await this.client.users.cache.get(this.highestScorers[0].dataValues.user_id);
        } else {

            console.info('No scores found');
        }

        if (this.highestScorers.length > 0) {
            console.log(this.highestScorers);
            console.log(this.highestScorers[0]);
            console.log(this.highestScorers[0].dataValues);
            console.log("THIS MAY BE IT:");
            console.log(this.highestScorers[0].dataValues.user_id);
            this.highestScore = this.highestScorers[0].total_points;
            console.log('Guild Trivia Champion: ' + this.guildTriviaChampion.username + ' with ' + this.highestScorers[0].dataValues.total_points + ' points');
        }
        return this.highestScorers;
    }
}

module.exports.TriviaGuild = TriviaGuild;
