
const { Timer } = require('./../timer.js');
const { EmbedBuilder }  = require('discord.js');

//This class sends the game introduction
class Intro {

    constructor(client, hostMember, hostGuild, rounds, difficulty, category, gameId) {
        
        this.client = client;
        this.hostMember = hostMember;
        this.hostGuild = hostGuild;
        this.rounds = rounds;
        this.difficulty = difficulty;
        this.category = category;
        this.gameId = gameId;

    }

    async send(channel) {
        return new Promise((resolve, reject) => {

            const timer = new Timer(60, 1, channel, "A new game is starting!");
            timer.start().then(() => {
                console.info("Intro Timer finished");
                resolve("Resolved");
                console.info("Intro resolved");
            });

            const embed = new EmbedBuilder()
            // Set the title of the field
            .setTitle('A New Game is about to start!')
            // Set the color of the embed
            .setColor(0x0066ff)
            // Set the main content of the embed
            .setDescription('A new game has started!')
            // Add originGuild icon to embedd
            .setThumbnail(this.hostGuild.iconURL())
            .addFields(
                { name: 'Host', value: this.hostMember.displayName, inline: true  },
                { name: 'Host Guild', value: this.hostGuild.name, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Rounds', value: this.rounds.toString(), inline: true },
                { name: 'Category', value: this.category, inline: true },
                { name: 'Difficulty', value: this.difficulty, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Trivia Game# ' + this.gameId, iconURL: this.client.user.displayAvatarURL() });
            // Send the embed to the trivia channel
            channel.send({ embeds: [embed] });  
        });
     
    }
}
  
module.exports.Intro = Intro;