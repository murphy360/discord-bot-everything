const { Events } = require('discord.js');

require('dotenv').config({ path: './../data/.env' });

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

// date string for logging
const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  module.exports = {
	name: Events.GuildScheduledEventUpdate,
	execute(guildOldScheduledEvent, guildNewScheduledEvent) {
		
		console.info(LOG_DATE + ": Old Event");
		console.info(guildOldScheduledEvent);

		console.info(LOG_DATE + ": New Event");
		console.info(guildNewScheduledEvent);

		// guild where the event is happening
		const eventGuild = client.guilds.cache.get(guildNewScheduledEvent.guild.id);

		// check what in the event changed
		// if the date changed, log it
		if (guildOldScheduledEvent.date != guildNewScheduledEvent.date) {
			console.info(LOG_DATE + ": Date changed from " + guildOldScheduledEvent.date + " to " + guildNewScheduledEvent.date);
		}
		// if the scheduledStartTimestamp changed, log it
		if (guildOldScheduledEvent.scheduledStartTimestamp != guildNewScheduledEvent.scheduledStartTimestamp) {
			console.info(LOG_DATE + ": scheduledStartTimestamp changed from " + guildOldScheduledEvent.scheduledStartTimestamp + " to " + guildNewScheduledEvent.scheduledStartTimestamp);
		}
		// if the scheduledEndTimestamp changed, log it
		if (guildOldScheduledEvent.scheduledEndTimestamp != guildNewScheduledEvent.scheduledEndTimestamp) {
			console.info(LOG_DATE + ": scheduledEndTimestamp changed from " + guildOldScheduledEvent.scheduledEndTimestamp + " to " + guildNewScheduledEvent.scheduledEndTimestamp);
		}
		// if the privacyLevel changed, log it
		if (guildOldScheduledEvent.privacyLevel != guildNewScheduledEvent.privacyLevel) {
			console.info(LOG_DATE + ": privacyLevel changed from " + guildOldScheduledEvent.privacyLevel + " to " + guildNewScheduledEvent.privacyLevel);
		}
		// if the status changed, log it
		if (guildOldScheduledEvent.status != guildNewScheduledEvent.status) {
			console.info(LOG_DATE + ": status changed from " + guildOldScheduledEvent.status + " to " + guildNewScheduledEvent.status);
		}
		// if the name changed, log it
		if (guildOldScheduledEvent.name != guildNewScheduledEvent.name) {
			console.info(LOG_DATE + ": Name changed from " + guildOldScheduledEvent.name + " to " + guildNewScheduledEvent.name);
		}
		// if the description changed, log it
		if (guildOldScheduledEvent.description != guildNewScheduledEvent.description) {
			console.info(LOG_DATE + ": Description changed from " + guildOldScheduledEvent.description + " to " + guildNewScheduledEvent.description);
		}
		// if the status changed, let's do something
		if (guildOldScheduledEvent.status != guildNewScheduledEvent.status) {
			const client = guildNewScheduledEvent.client;
			const devGuild = client.guilds.cache.get(DEV_GUILD_ID);
			const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
			
			console.info(LOG_DATE + ": Status changed from " + guildOldScheduledEvent.status + " to " + guildNewScheduledEvent.status);
			// if the status changed to SCHEDULED, log it
			if (guildNewScheduledEvent.status == 1) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was scheduled");
				devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was scheduled");
			}
			// if the status changed to ACTIVE, log it
			if (guildNewScheduledEvent.status == 2) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was started");
				devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was started");
			}
			// if the status changed to COMPLETED, log it
			if (guildNewScheduledEvent.status == 3) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was completed");
				devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was completed");
			}
			// if the status changed to CANCELLED, log it
			if (guildNewScheduledEvent.status == 4) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was cancelled");
				devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was cancelled");
			}
		}


	},
  };