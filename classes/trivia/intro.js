const { Timer } = require('../common/timer.js');
const { EmbedBuilder }  = require('discord.js');

//This class sends the game introduction
class Intro {
   
    constructor(client, hostMember, hostGuild, rounds, difficulty, categoryName, gameId) {
        this.timerSec = 10;
        this.client = client;
        this.hostMember = hostMember;
        this.hostGuild = hostGuild;
        this.rounds = rounds;
        this.difficulty = difficulty;
        this.categoryName = categoryName;
        this.gameId = gameId;
    }

    async send(channel) {
        return new Promise((resolve, reject) => {
            // Get Player Role
            const playerRole = this.hostGuild.roles.cache.find(role => role.name === 'Player');


            const embed = new EmbedBuilder()
            // Set the title of the field
            .setTitle('A New Game is about to start!')
            // Set the color of the embed
            .setColor(0x0066ff)
            // Set the main content of the embed
            .setDescription(`<@&${playerRole.id}> A new game has started!`)
            // Add originGuild icon to embedd
            .setThumbnail(this.hostGuild.iconURL())
            .addFields(
                { name: 'Host', value: this.hostMember.displayName, inline: true  },
                { name: 'Host Guild', value: this.hostGuild.name, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Rounds', value: this.rounds.toString(), inline: true },
                { name: 'Category', value: this.categoryName, inline: true },
                { name: 'Difficulty', value: this.difficulty, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Trivia Game# ' + this.gameId, iconURL: this.client.user.displayAvatarURL() });
            // Send the embed to the trivia channel
            channel.send({ embeds: [embed] });  

            const timer = new Timer(this.timerSec, 1, channel, "A new game is starting!");
            timer.start().then(() => {
                resolve("Resolved");
            });
        });
    }
}
  
module.exports.Intro = Intro;