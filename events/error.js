const { Events } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

module.exports = {
	name: Events.Error,
	execute(error) {
		
		console.info("error.js");
		console.info(error);
	},
  };