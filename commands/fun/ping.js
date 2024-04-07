const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
    console.info('ping.js');
	
	// Defer Reply
	await interaction.deferReply();
	return interaction.editReply('Pong!');
	},
};