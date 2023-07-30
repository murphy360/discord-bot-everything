const { Events, EmbedBuilder} = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

module.exports = {
	name: Events.GuildDelete,
	async execute(guild) {

		let devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
		let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		
		// Create embed for logging
        let embed = new EmbedBuilder()
            .setDescription(guild.name)
            // Set the title of the field
            .setTitle('Leaving Guild')
            // Set the color of the embed
            .setColor(0xff0000) // Red
            // Set the main content of the embed
            .setThumbnail(guild.iconURL())
            .setTimestamp()
		
		devChannel.send({ embeds: [embed] });    
		console.info(`Exiting: + ${guild.name}`);
	},
};