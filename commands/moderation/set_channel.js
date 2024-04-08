require('dotenv').config({ path: './../data/.env' });
const { SlashCommandBuilder, PermissionsBitField  } = require('discord.js');
const { Guilds } = require('./../../models/Guilds.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');
const { SystemCommands } = require('./../../classes/Helpers/systemCommands.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_channel')
		.setDescription('Set the channel for trivia games!')
		.addStringOption(option =>
			option.setName('channel_name')
				.setDescription('The name of the channel to set')
				.setRequired(true)),
		
	async execute(interaction) {
		console.info('set_channel.js: ' + interaction.guild.name + ' / ' + interaction.channel.name + ' / ' + interaction.user.username + ' / ' + interaction.commandName + ' / ' + interaction.options.getString('channel_name') + ' / ' + interaction.options.getString('channel_id') + ' / ' + interaction.options.getString('channel_type') + ' / ' + interaction.options.getString('channel_created_at') + ' / ' + interaction.options.getS);
		
		// Defer Reply
		await interaction.deferReply();
		// Check if user is an admin
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.editReply({ content: 'You must be an administrator to use this command.', ephemeral: true });
		}

		// get triviaGuild object
		const triviaGuild = new TriviaGuild(interaction.guild);
		const oldTriviaChannel = await triviaGuild.getGuildTriviaChannel();
		const helper = new SystemCommands();

		if (oldTriviaChannel) {
			console.info('set_channel.js: oldTriviaChannel: ' + oldTriviaChannel.name);
		}

		const newChannelName = interaction.options.getString('channel_name');
		const newChannel = interaction.guild.channels.cache.find(channel => channel.name === newChannelName);

		// Check if new channel exists
		if (newChannel) {
			// Check if channel has correct permissions
			await triviaGuild.setGuildTriviaChannel(newChannel);
			await triviaGuild.checkGuildCriticalSetup();
			if (!triviaGuild.isReady) {
				const embed = await getHelpEmbedErrors(triviaGuild.contextData, client);
				return interaction.editReply({ embeds: [embed], ephemeral: true });
			} else {
				return interaction.editReply({ content: 'Trivia channel set to ' + newChannelName + '.', ephemeral: true });
			}
		} else {
			return await interaction.editReply({ content: 'I couldn\'t find a channel with that name.', ephemeral: true });
		}
	},
};