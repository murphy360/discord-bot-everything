const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {

		let devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
		let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");

		// Create embed for logging
        let embed = new EmbedBuilder()
            .setDescription('New Guild Joined')
            // Set the title of the field
            .setTitle(guild.name)
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setThumbnail(guild.iconURL())
            .setTimestamp()
		
		devChannel.send({ embeds: [embed] });    

		const triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
		if (!triviaChannel) {
			console.info('Joining Guild: ' + guild.name);
			console.info('Trivia Channel Does Not Exist, creating it now');
			const defaultChannel = guild.systemChannel;
            const parentTextChannelId = defaultChannel.parentId;
			guild.channels.create({
				name: TRIVIA_CHANNEL,
					type: 0,
					parent: parentTextChannelId,
				});
		} else {
			console.info('Trivia Channel Exists: ' + triviaChannel.name);
		}
	},
  };