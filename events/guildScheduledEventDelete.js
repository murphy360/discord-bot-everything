const { Events } = require('discord.js');

require('dotenv').config({ path: './../data/.env' });

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

// date string for logging
const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

module.exports = {
	name: Events.GuildScheduledEventDelete,
	execute(guildScheduledEvent) {
		console.info("Event Deleted");
		console.info(guildScheduledEvent);

		const client = guildScheduledEvent.client;
		const eventGuild = client.guilds.cache.get(guildScheduledEvent.guild.id);
		const devGuild = client.guilds.cache.get(DEV_GUILD_ID);
		const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		const startDateString = new Date(guildScheduledEvent.scheduledStartTimestamp).toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // Output: "15 Jun 2023 09:55:00"
		const endDateString = new Date(guildScheduledEvent.scheduledEndTimestamp).toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // Output: "15 Jun 2023 09:55:00"
		devChannel.send(LOG_DATE + ": Event Deleted in " + eventGuild.name + " called " + guildScheduledEvent.name + " from " + startDateString + " to " + endDateString + " with host: " + guildScheduledEvent.creator.username);
	},
  };