const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const { SystemCommands } = require('./../classes/Helpers/systemCommands.js');

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const playerRoleName = process.env.PLAYER_ROLE;

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {

		let devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
		let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		
        

		// Create embed for logging
        let embed = new EmbedBuilder()
            .setDescription(guild.name)
            // Set the title of the field
            .setTitle('New Guild Joined')
            // Set the color of the embed (green)
            .setColor(0x00ff00) // Green
            // Set the main content of the embed
            .setThumbnail(guild.iconURL())
            .setTimestamp()
		
		devChannel.send({ embeds: [embed] });    

		console.info(`Entering new guild: + ${guild.name} + checking setups`);

		const helper = new SystemCommands();
		let contextData = await helper.checkPermissions(guild);
		
		if (contextData.length == 0) {
			await helper.checkChannel(guild);
			await helper.checkRole(guild);
			helper.introduceBotToGuild(guild, contextData);
		} else {
			console.log('Exiting guild ' + guild.name + ' due to missing permissions');
			console.info(contextData.length);
			helper.exitGuild(guild, contextData, true);
		}
	},
  };