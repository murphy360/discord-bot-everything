require('dotenv').config({ path: './../data/.env' });
const { SlashCommandBuilder, PermissionsBitField  } = require('discord.js');
const { Guilds } = require('./../../models/Guilds.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');
const { SystemCommands } = require('./../../classes/Helpers/systemCommands.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_guild_channel')
		.setDescription('Set the channel for one of your guilds!')
		.addStringOption(option =>
			option.setName('channel_id')
				.setDescription('The ID of the channel to set')
				.setRequired(true))
        .addStringOption(option =>
            option.setName('guild_id')
                .setDescription('The Guild ID to set the channel for')
                .setRequired(true)),
		
	async execute(interaction) {

		console.info('set_guild_channel.js: ' + interaction.guild.name + ' / ' + interaction.channel.name + ' / ' + interaction.user.username + ' / ' + interaction.commandName + ' / ' + interaction.options.getString('channel_name') + ' / ' + interaction.options.getString('channel_id') + ' / ' + interaction.options.getString('channel_type') + ' / ' + interaction.options.getString('channel_created_at') + ' / ' + interaction.options.getS);
		
		// Defer Reply
		await interaction.deferReply();
		// Check if user is an admin
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.editreply({ content: 'You must be an administrator to use this command.', ephemeral: true });
		}

		// get triviaGuild object
        const targetGuild = interaction.client.guilds.cache.find(guild => guild.id === interaction.options.getString('guild_id'));
		if (!targetGuild) {
            return interaction.editreply({ content: 'I couldn\'t find a guild with that ID.', ephemeral: true });
        }
        
        const triviaGuild = new TriviaGuild(targetGuild);
		const oldTriviaChannel = await triviaGuild.getGuildTriviaChannel();

		if (oldTriviaChannel) {
			console.info('set_channel.js: oldTriviaChannel: ' + oldTriviaChannel.name);
		}

		const newChannelId = interaction.options.getString('channel_id');
		const newChannel = targetGuild.channels.cache.find(channel => channel.id === newChannelId);

		// Check if new channel exists
		if (newChannel) {
			// Check if channel has correct permissions
			await triviaGuild.setGuildTriviaChannel(newChannel);
			await triviaGuild.checkGuildCriticalSetup();
			if (!triviaGuild.isReady) {
				const embed = await getHelpEmbedErrors(triviaGuild.contextData, client);
				return interaction.editreply({ embeds: [embed], ephemeral: true });
			} else {
				return interaction.editreply({ content: 'Trivia channel set to ' + newChannel.name + '.', ephemeral: true });
			}
		} else {
			return interaction.editreply({ content: 'I couldn\'t find a channel with that ID.', ephemeral: true });
		}
	},
};