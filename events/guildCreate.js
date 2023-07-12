const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const { SystemCommands } = require('./../classes/Helpers/systemCommands.js');

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const playerRoleName = process.env.PLAYER_ROLE;

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {

		console.info(`Entering new guild: + ${guild.name} + checking setups`);

		const helper = new SystemCommands();
		let contextData = await helper.checkGuildSetup(guild);
		
		if (contextData.length == 0) {
			devChannelReport(true);
			helper.introduceBotToGuild(guild, contextData);
			
		} else {
			devChannelReport(false);
			helper.reportErrorToGuild(guild, contextData, true);
		}

		async function devChannelReport(isHealthy){
			let devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
			let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot"); 
			let description = '';
			let color = '';
			if (isHealthy) {
				description = 'New server joined with necessary permissions.';
				color = 0x00ff00; // Green
			} else {
				description = 'New server joined but is having issues with permissions.';
				color = 0xffa500; // Orange
			}

			let embed = new EmbedBuilder()
				.setDescription(description)
				.setTitle('New Guild Joined: ' + guild.name)
				.setColor(color)
				// Set the main content of the embed
				.setThumbnail(guild.iconURL())
				.setTimestamp()
			devChannel.send({ embeds: [embed] });    
		}
	},
  };