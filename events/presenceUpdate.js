const { Events } = require('discord.js');

module.exports = {
	name: Events.PresenceUpdate,
	execute(oldPresence, newPresence) {
		console.info(`Old to new presence`);
		console.info(oldPresence);
		console.info(newPresence);
		
	},
  };