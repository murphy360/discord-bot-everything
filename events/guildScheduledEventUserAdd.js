const { Events } = require('discord.js');

require('dotenv').config({ path: './../data/.env' });

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

// date string for logging
const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

module.exports = {
	name: Events.GuildScheduledEventUserAdd,
	execute(guildScheduledEvent, user) {
		
		console.info(LOG_DATE + ": " + user.username + " was added to " + guildScheduledEvent.name );

	
		const client = guildScheduledEvent.client;
		const devGuild = client.guilds.cache.get(DEV_GUILD_ID);
		const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		devChannel.send(LOG_DATE + ": " + user.username + " was added to " + guildScheduledEvent.name );
	},
  };