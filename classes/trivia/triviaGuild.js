const { EmbedBuilder, PermissionsBitField }  = require('discord.js');
const { Guilds } = require('./../../dbObjects.js');
require('dotenv').config({ path: './../data/.env' });
// Names of channels to use
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;

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
        console.info(this.guild.name + ": New TriviaGuild answer.user.guild.name: " + this.guild.name);
        this.DATE_JOINED = new Date();
        this.answers = new Array();
        this.players = new Array(); // Array of players in the guild
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

    async addPlayer(player) {            // Adds a player to the player's array
        //console.info(this.guild.name + ': Adding player to guild: ' + this.guild.name + ' ' + player.user.username);
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

    async sendGameGuildScoreBoard(winningMember, winningGuild) {
        console.info('sendGameGuildScore: ' + this.guild.name);
        const channel = this.guild.channels.cache.find(
            channel => channel.name.toLowerCase() === TRIVIA_CHANNEL);
        const embed = this.createGameScoreboardEmbed(winningMember, winningGuild);

        channel.send({ embeds: [embed] });
        this.setGuildChampionRole();
    }

    // Create question winner embed
    createGameScoreboardEmbed(winningMember, winningGuild) {
        console.info(this.guild.name + ": Creating Game Scoreboard Embed for " + this.guild.name);
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
        
        console.info(this.guild.name + ": Guild Score: " + this.currentScore + " Winner: " + winner.user.username);
        let embed = new EmbedBuilder()
            .setTitle(this.guild.name + ' Final Scoreboard')
            .addFields(
                {name: 'Game Winner', value: winningMember.username, inline: true},
                {name: 'Guild Winner', value: winner.user.username, inline: true},
                {name: 'Winning Guild', value: winningGuild.name, inline: true},
                {name: '\u200B', value: '\u200B'},
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
    
        console.info(this.guild.name + ': Guild Champion: ' + guildChampion.user.username);
        const roleName = "Guild Trivia Champion";

        
        // Check if role exists
        let guildChampRole = await this.guild.roles.cache.find(role => role.name === roleName);
        // Create role if it doesn't exist
        if (!guildChampRole) {
            console.info(this.guild.name + ': Role ' + roleName + ' Doesn\'t exist');
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
            
            const currentChampions = await guildChampRole.members.map(member => member);
            console.info(this.guild.name + ': Current Num Guild Trivia Champions: ' + currentChampions.length);
            if (!currentChampions.length > 0) {
                // No current champion so add the role to the guild champion
                console.info(this.guild.name + ': First Champion!');
                guildChampion.roles.add(guildChampRole.id);
            } else if (currentChampions[0].user.id === guildChampion.user.id) {
                console.info(this.guild.name + ': Guild Champion is already the Guild Trivia Champion');
            } else {    
                console.info(this.guild.name + ': Removing Guild Trivia Champion from all and adding to ' + guildChampion.user.username);
                await currentChampions.forEach(member => {
                    member.roles.remove(guildChampRole.id);
                });
                
                await guildChampion.roles.add(guildChampRole.id);
                console.info(this.guild.name + ': Guild Trivia Champion is now ' + guildChampion.user.username);
            }
        } else {
            console.info(this.guild.name + ': ' + roleName + ' Role not found');
        }
    }

    async createGuildRole(roleName) {

        return new Promise(async (resolve, reject) => {

            console.info(this.guild.name + ': Role ' + roleName + ' Doesn\'t exist. Creating it.');
            
            // Create Player role
            await this.guild.roles.create({
                name: roleName,
                color: '#00ff00', // Green
                hoist: true,
                position: 105,
            }).then(async role => {
                console.info(this.guild.name + ': Role ' + role.name + ' created');
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
                console.info('Returning role: ' + role.name);
                resolve(role);
            }).catch(console.error); 
        });
    }

    async setPlayerGuildRole(user) {
        const roleName = "Player";
        

        // Get Guild Champion guildMember object
        const guildMember = await this.guild.members.fetch(user.id);
        console.info('Guild Member: ' + guildMember.user.username);

        // Check if role exists
        let playerRole = await this.guild.roles.cache.find(role => role.name === roleName);
        


        // Create role if it doesn't exist
        if (!playerRole) {
             await this.createGuildRole(roleName).then(role => {
                console.info('Resolved Role: ' + role.name);
                playerRole = role;
             }).catch(console.error);
             
            
        // Role exists && Member has role so do nothing    
        } else if (guildMember.roles.cache.has(playerRole.id)) {
            console.info(this.guild.name + ': Member ' + guildMember.user.username + ' already has role ' + playerRole.name);
            return;
        } 
        
        // Role exists && Member doesn't have role so add it (And remove Noob role)
        console.info(this.guild.name + ': Role ' + playerRole.name + ' Exists');
        // Add the role to the the Player
        console.info(this.guild.name + ': Adding role ' + playerRole.name + ' to ' + guildMember.user.username);
        await guildMember.roles.add(playerRole.id);
        console.info(this.guild.name + ': Role added ' + playerRole.name + ' to ' + guildMember.user.username);
        await this.triviaChannel.send(`Level Up! ${guildMember.user.username}, You are now a Player!`);
        
        this.removeRole(guildMember, 'Noob');
        

 

		if (playerRole) {  
            console.info(this.guild.name + ': Role Exists: ' + playerRole.name);
            // check if member has role
            

        } else {
            console.info(this.guild.name + ': Role ' + roleName + ' Doesn\'t exist. Not adding it.');
        }


    }

    // remove the Noob role from the member
    async removeRole(guildMember, roleName) {
                    
        const noobRole = await this.guild.roles.cache.find(role => role.name === roleName);
        if (noobRole) {
            console.info(this.guild.name + ': Removing role ' + noobRole.name + ' from ' + guildMember.user.username);
            if (guildMember.roles.cache.has(noobRole.id)) {
                console.info(this.guild.name + ': Member ' + guildMember.user.username + ' has role ' + noobRole.name);
                guildMember.roles.remove(noobRole.id);
                return;
            }
            
            console.info(this.guild.name + ': Role removed ' + noobRole.name + ' from ' + guildMember.user.username);
        }
    }

    async storeGuildToDb() {
        
		const DBguild = await Guilds.findOne({ where: { guild_id: this.guild.id } });
        if (DBguild) {      
            // Guild already exists in database
            console.info(this.guild.name + ': Guild found in database: ' + this.guild.name);
        } else {
            // Create Guild in database
            console.info(this.guild.name + ': Guild not found in database, adding now. ' + this.guild.name);
            await Guilds.create({ guild_id: this.guild.id, guild_name: this.guild.name, trivia_points_total: 0});
        } 
        const gameXP = this.getGuildsGameXP();
        console.info(this.guild.name + ': Adding XP to guild: ' + this.guild.name + ' ' + gameXP);
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
