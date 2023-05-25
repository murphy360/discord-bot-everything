const { Events } = require('discord.js');

module.exports = {
	name: Events.PresenceUpdate,
	execute(oldPresence, newPresence) {
		console.info(`Presence went from ${oldPresence} to ${newPresence}!`);
		
	},
  };