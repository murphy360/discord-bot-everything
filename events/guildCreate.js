const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const { SystemCommands } = require('./../classes/Helpers/systemCommands.js');
const { TriviaGuild } = require('./../classes/trivia/triviaGuild.js');

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const playerRoleName = process.env.PLAYER_ROLE;

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {

		console.info(`Entering new guild: + ${guild.name} + checking setups`);

		const helper = new SystemCommands();
		const triviaGuild = new TriviaGuild(guild);
		await triviaGuild.checkGuildCriticalSetup();

		if (triviaGuild.isReady) {
			devChannelReport("FullSetup");
			helper.introduceBotToGuild(guild, triviaGuild.contextData);
		} else {
			devChannelReport("NoSetup");
		}

		async function devChannelReport(setupType) {
			let devGuild = await guild.client.guilds.cache.get(DEV_GUILD_ID);
			let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot"); 
			let description = '';
			let color = '';
			if (setupType == "FullSetup") {
				description = 'New server joined with all necessary permissions.';
				color = 0x00ff00; // Green
			} else if (setupType == "CriticalSetup") {
				description = 'New server joined but has basic permissions required to play';
				color = 0xffa500; // Orange
			} else {
				description = 'New server joined but is missing some permissions required to play';
				color = 0xff0000; // Red
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