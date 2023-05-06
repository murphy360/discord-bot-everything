const { Events } = require('discord.js');

module.exports = {
	name: Events.PresenceUpdate,
	execute(oldPresence, newPresence) {
	  if (newPresence.status === 'online') {
		console.log(`${newPresence.user.tag} is now online!`);
	  } else if (newPresence.status === 'offline') {
		console.log(`${newPresence.user.tag} is now offline!`);
	  }
	},
  };