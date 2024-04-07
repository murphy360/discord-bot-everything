const { SlashCommandBuilder } = require('discord.js');
const { ChangeLog } = require('../../classes/Helpers/changeLog.js');
require('dotenv').config({ path: './../data/.env' });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('tells you what happened'),
	async execute(interaction) {
		console.info('develop.js');
		// Defer Reply
		await interaction.deferReply();
		await interaction.editReply('Sure, hold on a minute...');
		const changeLog = new ChangeLog(interaction.client);
		const embed = await changeLog.createChangeLogEmbed();
		interaction.editReply({ embeds: [embed] });
	},
};