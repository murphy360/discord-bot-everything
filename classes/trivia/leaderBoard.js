const { EmbedBuilder }  = require('discord.js');
const { Users } = require('./../../dbObjects.js');
const { Sequelize, Op } = require('sequelize');
require('dotenv').config({ path: './../data/.env' });
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const WORLD_CHAMPION_ROLE = process.env.WORLD_CHAMPION_ROLE;
const { SystemCommands } = require('./../Helpers/systemCommands.js');

//This class sends the game introduction
class LeaderBoard {
   
    constructor(client) {
        this.client = client;
        this.tiedChamps = null; 
        this.highestScorers = null;
        this.worldTriviaChampion = null;    // The user with the highest trivia_points_total (DBObject)
        console.info('LeaderBoard constructor ' + this.client.user.username);
        
    }

    // Find the world champion
    async findHighScores() {
        console.info('setHighScorers');
        this.highestScorers = await Users.findAll({
            order: [['trivia_points_total', 'DESC']],
            limit: 10,
          });
        const highestScore = this.highestScorers[0].trivia_points_total;
        if (this.highestScorers[0].trivia_points_total === this.highestScorers[1].trivia_points_total) {
            console.info('Tie for top score - Currently Unhandled'); // TODO Handle ties for top score
            this.worldTriviaChampion = this.highestScorers[0];
            this.tiedChamps = Users.findAll({
                where: { trivia_points_total: highestScore },
            });
        } else {
            this.worldTriviaChampion = this.highestScorers[0];
        }
            
        console.log(WORLD_CHAMPION_ROLE + ": " + this.worldTriviaChampion.user_name);
    }

    async postManualWorldLeaderBoard(interaction) {
        console.info('postWorldLeaderBoard World Trivia Champion: ');
        await this.findHighScores();
        let embed = await this.getWorldLeaderBoardEmbed();
        interaction.reply({ embeds: [embed] }); 
    }

    async getWorldLeaderBoardEmbed() {
        
        return new Promise((resolve, reject) => {
            console.info('postWorldLeaderBoard World Trivia Champion: ' + this.worldTriviaChampion.user_name);
            let leaderNameString = "";
            let leaderScoreString = "";
            let leaderXPString = "";

            // Find the lower of this.highesScorers.length and 10
            let maxScores = 10;
            if (this.highestScorers.length < 10) {
                maxScores = this.highestScorers.length;
            }
            
            for (let i = 0; i < maxScores; i++) {
                leaderNameString += this.highestScorers[i].user_name + '\n';
                leaderScoreString += this.highestScorers[i].trivia_points_total + '\n';
                leaderXPString += this.highestScorers[i].total_xp + '\n';
            }
 
            const embed = new EmbedBuilder()
            // Set the title of the field
            .setTitle('World Trivia LeaderBoard!')
            // Set the color of the embed
            .setColor(0x0066ff)
            // Set the main content of the embed
            .setDescription('Trivia Champion has reigned for: (I\ll fill this out sometime)')
            // Add originGuild icon to embedd
            //.setThumbnail(this.hostGuild.iconURL())
            .addFields(
                { name: 'Reigning Champion', value: this.worldTriviaChampion.user_name, inline: true  },
                { name: 'Trivia Score', value: this.worldTriviaChampion.trivia_points_total.toString(), inline: true  },
                { name: 'XP', value: this.worldTriviaChampion.total_xp.toString(), inline: true  },
                //{ name: 'Score', value: this.worldTriviaChampion.trivia_points_total, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'High Scores:', value: leaderNameString, inline: true },
                { name: 'Trivia Scores:', value: leaderScoreString, inline: true },
                { name: 'XP:', value: leaderXPString, inline: true },
             
            )
            .setTimestamp()
            //.setFooter({ text: 'Trivia Game# ' + this.gameId, iconURL: this.client.user.displayAvatarURL() });
            // Send the embed to the trivia channel
            
            resolve(embed);
        });
    }

    // set World Trivia Champion Role
    async setWorldTriviaChampionRole() {

        const helper = new SystemCommands();
        let worldChampionChange = false;       
        await this.findHighScores();       
        console.info('World Trivia Champion: ' + this.worldTriviaChampion.user_name);
        // Create and set the role to the world champion in each guild they exist. If the role doesn't exist, create it
        this.client.guilds.cache.forEach(async guild => {
            
            console.log(`Guild Name: ${guild.name}`);
            
            // Get the role object if it exists (returns if it doesn't exist)
            if (!await helper.createGuildRoles(guild)) {
                console.info('World Trivia Champion Role does not exist in ' + guild.name + ' guild and cannot be created' );
                return;
            }

            let role = await guild.roles.cache.find(role => role.name === WORLD_CHAMPION_ROLE);
            if (!role) {
                console.info('World Trivia Champion Role does not exist in ' + guild.name + ' guild and cannot be created' );
                return;
            }
            
            // Get the members with the role currently
            const currentWorldChampions = role.members.map(member => member);
            console.info(guild.name + ': Number of World Trivia Champions: ' + currentWorldChampions.length);
            
            if (!currentWorldChampions.length) { // If there are no current World Trivia Champions, add the role to the new one
                console.info('No current World Trivia Champions');
                worldChampionChange = true;
            } else if (this.worldTriviaChampion.user_id === currentWorldChampions[0].user.id) {             // If the current World Trivia Champion is the same as the role holder
                console.info('Current World Trivia Champion is the same as the role holder');
                return;   
            } else if (this.worldTriviaChampion.user_id !== currentWorldChampions[0].id) {      // The current World Trivia Champion is being unseated. Remove the role from the current World Trivia Champion and add it to the new one
                for (let i = 0; i < currentWorldChampions.length; i++) {
                    console.info('Removing role from: ' + currentWorldChampions[i].user.username);
                    // Remove the role from everyone in the guild (Just in Case)
                    await currentWorldChampions[i].roles.remove(role);
                }
                worldChampionChange = true;
            }

            // Verify that worldTriviaChampion is a member of this guild
            if (!guild.members.cache.has(this.worldTriviaChampion.user_id)) {
                console.info(this.worldTriviaChampion.user_name +', the World Trivia Champion is not a member of ' + guild.name);
                return;
            } else {
                // Get World Trivia Champion Guild Member object from client
                const worldTriviaChampionGuildMember = await guild.members.fetch(this.worldTriviaChampion.user_id);
                // Add the role to the member
                await worldTriviaChampionGuildMember.roles.add(role);
            }
            
            if (worldChampionChange) {
                // Send message to the guild that the World Trivia Champion has changed
                console.info('Sending message to ' + guild.name +' guild that the World Trivia Champion has changed');
                let embed = await this.getWorldLeaderBoardEmbed();
                // Send the embed to the trivia channel of the current guild
                const triviaChannel = guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
                triviaChannel.send({ embeds: [embed] });
            }
            return;
        });
    }
}
  
module.exports.LeaderBoard = LeaderBoard;