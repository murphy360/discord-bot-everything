const { Events } = require('discord.js');

require('dotenv').config({ path: './../data/.env' });

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

// date string for logging
const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');


module.exports = {
	name: Events.GuildScheduledEventCreate,
	execute(guildScheduledEvent) {
		console.info("Event Created");
		
		const client = guildScheduledEvent.client;
		const eventGuild = client.guilds.cache.get(guildScheduledEvent.guild.id);
		const devGuild = client.guilds.cache.get(DEV_GUILD_ID);
		const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		const startDateString = new Date(guildScheduledEvent.scheduledStartTimestamp).toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // Output: "15 Jun 2023 09:55:00"
		const endDateString = new Date(guildScheduledEvent.scheduledEndTimestamp).toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // Output: "15 Jun 2023 09:55:00"
		if (guildScheduledEvent.name.includes('Trivia') || guildScheduledEvent.name.includes('trivia')) {
			devChannel.send(LOG_DATE + ": Event Created in " + eventGuild.name + " called " + guildScheduledEvent.name + " from " + startDateString + " to " + endDateString + " with host: " + guildScheduledEvent.creator.username);
			console.info("Guild: " + eventGuild.name + " has a trivia event scheduled");
		}
	},
  };