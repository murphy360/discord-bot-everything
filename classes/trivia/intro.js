const { Timer } = require('../common/timer.js');
const { EmbedBuilder }  = require('discord.js');
const { ChatGPTClient } = require('./../chatGPT/ChatGPTClient.js');

//This class sends the game introduction
class Intro {
   
    constructor(client, hostUser, hostGuild, rounds, difficulty, categoryName, gameId, timerSec) {
        this.timerSec = timerSec;
        this.client = client;
        this.hostUser = hostUser;
        this.hostGuild = hostGuild;
        this.rounds = rounds;
        this.difficulty = difficulty;
        this.categoryName = categoryName;
        this.gameId = gameId;
        this.description = ' A new game is starting!';

       
    }

    async setDescription() {
        return new Promise(async (resolve, reject) => {
            let chatGPTClient = new ChatGPTClient();
            let descriptionContextData = [];
            descriptionContextData.push({
                role: 'user',
                content: 'The Player who started the game is: ' + this.hostUser.username
            });
            descriptionContextData.push({
                role: 'user',
                content: 'The host guild is: ' + this.hostGuild.name
            });
            descriptionContextData.push({
                role: 'user',
                content: 'There will be ' + this.rounds + ' rounds'
            });
            descriptionContextData.push({
                role: 'user',
                content: 'The category is: ' + this.categoryName
            });
            descriptionContextData.push({
                role: 'user',
                content: 'The difficulty is: ' + this.difficulty
            });
            descriptionContextData.push({
                role: 'user',
                content: 'The game id is: ' + this.gameId
            });

            
            let model = 'gpt-4';
            if (this.rounds < 10) {
                model = 'gpt-3.5-turbo';
            }
    
            
            this.description = await chatGPTClient.introDescription(descriptionContextData, model);
            console.info('intro.js: setDescription: ' + this.description);
            resolve(this.description);
        });
    }

    async send(channel) {    
        console.info('intro.js: send to Guild: ' + channel.guild.name + ' Host: ' + this.hostUser.username);
        return new Promise(async (resolve, reject) => {
            const embed = new EmbedBuilder()
            // Set the title of the field
            .setTitle('A New Game is about to start!')
            // Set the color of the embed
            .setColor(0x0066ff)
            // Add originGuild icon to embedd
            .setThumbnail(this.hostGuild.iconURL())
            .addFields(
                { name: 'Host', value: this.hostUser.username, inline: true  },
                { name: 'Host Guild', value: this.hostGuild.name, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Rounds', value: this.rounds.toString(), inline: true },
                { name: 'Category', value: this.categoryName, inline: true },
                { name: 'Difficulty', value: this.difficulty, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Trivia Game# ' + this.gameId, iconURL: this.client.user.displayAvatarURL() });

            // Get Player Role for Guild (If it exists)
            const playerRole = channel.guild.roles.cache.find(role => role.name === 'Player');
            
            if (playerRole) {
                // Set the main content of the embed
                embed.setDescription(`<@&${playerRole.id}> ${this.description}`)
            } else {
                console.log('intro.js: Player Role Does Not Exist in Guild: ' + channel.guild.name);
                embed.setDescription(this.description);
            }
            // Send the embed to the trivia channel
            if (channel) {
                try {
                    await channel.send({ embeds: [embed] });
                } catch (error) {
                    console.error('intro.js: Error sending embed to channel: ' + channel.guild.name);
                    console.error(error);
                }  
            } else {
                console.log('intro.js: Channel Does Not Exist in Guild: ' + channel.guild.name);
                resolve("Channel Does Not Exist");
            }
            

            const timer = new Timer(this.timerSec, 1, channel, "A new game is starting!");
            try {
                timer.start().then(() => {
                    resolve("Resolved");
                });
            } catch (error) {
                console.error('intro.js: Error starting timer in channel: ' + channel.guild.name);
                console.error(error);
                resolve("Resolved");
            }
            
        });
    }
}
  
module.exports.Intro = Intro;