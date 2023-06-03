const { EmbedBuilder, PermissionsBitField }  = require('discord.js');
const { Player } = require('./player.js');
const { Guilds } = require('./../../dbObjects.js');
require('dotenv').config({ path: './../data/.env' });
// Names of channels to use
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;
const PLAYER_ROLE = process.env.PLAYER_ROLE;

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

        channel.send({ embeds: [embed] });
        this.setGuildChampionRole(worldChampionUser);
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

            // Find the player role
            const playerRole = await this.guild.roles.cache.find(role => role.name === PLAYER_ROLE);

            // Get all members with the player role
            const playerMembers = await playerRole.members.map(member => member);
      
            
            // Query your database for answers by players in this guild answered for this guild
            for (let i = 0; i < playerMembers.length; i++) {
                this.allGuildPlayers.push(new Player(playerMembers[i].user))
                console.info(this.guild.name + ': Adding player to All Guild Players: ' + this.guild.name + ' ' + playerMembers[i].user.username);
                await this.allGuildPlayers[i].storePlayerToDb();
                await this.allGuildPlayers[i].setTriviaPointsByGuild(this.guild.id);
            }



            // Sort players by points
            this.allGuildPlayers.sort((a, b) => (a.guildTriviaPoints > b.guildTriviaPoints) ? 1 : -1);
            this.allGuildPlayers.reverse();



            // Check for tie
            if (this.allGuildPlayers.length === 1) {
                console.info(this.guild.name + ': Only one player in guild');

            } else if (this.allGuildPlayers[0].trivia_points_total === this.allGuildPlayers[1].trivia_points_total) {
                console.info(this.guild.name + ': Tie for Guild Champion');
                // Check for tie
                // If tie, check for tiebreaker
            } else {
                console.info(this.guild.name + ': length of allGuildPlayers: ' + this.allGuildPlayers.length);
            }

            let guildChampion = await this.guild.members.fetch(this.allGuildPlayers[0]); 
            // Guild Champion can't be World Champion
            console.info(this.guild.name + ': World Champion ID: ' + worldChampionUser.id);
            console.info(this.guild.name + ': Guild Champion ID: ' + guildChampion.user.id);
            
            
            if (worldChampionUser.id === guildChampion.user.id) {
                console.info(this.guild.name + ': World Champion deconflicts Guild Champion');
                
                console.info(this.guild.name + ': length of allGuildPlayers: ' + this.allGuildPlayers.length);
                guildChampion = await this.guild.members.fetch(this.allGuildPlayers[1]);
                // Guild Champion can't be World Champion
                console.info(this.guild.name + ': World Champion ID: ' + worldChampionUser.id);
                console.info(this.guild.name + ': Guild Champion ID: ' + guildChampion.user.id);
            }

           
            console.info("Printing Guild Champion");
            return guildChampion;
    
    }

    // set Guild Champion Role
    async setGuildChampionRole(worldChampionUser) {

        // Get Guild Champion guildMember object
        const guildChampion = await this.findGuildChampion(worldChampionUser);
        const roleName = "Guild Trivia Champion";

        
        // Check if role exists
        let guildChampRole = await this.guild.roles.cache.find(role => role.name === roleName);
        // Create role if it doesn't exist
        if (!guildChampRole) {
            guildChampRole = await this.guild.roles.create({
                // Create Guild Champion Role
                name: roleName,
                color: '#c0c0c0',       // SILVER hex is #C0C0C0
                hoist: true,
                position: 115,
                
            }).then(role => {
                //TODO add some cool permissions
                console.info(this.guild.name + ': Role ' + role.name + ' created');
            }).catch(console.error);
        } 

        if (guildChampRole) {      
            console.info(this.guild.name + ': ' + roleName + ' Role found - Now checking for current champions');
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
            console.info(this.guild.name + ': ' + roleName + ' Role not found');
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
}

module.exports.TriviaGuild = TriviaGuild;
