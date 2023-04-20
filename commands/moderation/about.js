const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('All about the bot!'),
	async execute(interaction) {
    console.info('about.js');
		return interaction.reply('This bot was written by Christian Acord and Corey Murphy.  It was originally forked from sitepoint-editors/discord-bot-sitepoint.  Current iteration supports basic sing-word commands such as ping and about. Feel free to contribute');
	},
};