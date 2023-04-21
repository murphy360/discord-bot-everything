const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('All about the bot!'),
	async execute(interaction) {
    console.info('about.js');
	const botname = interaction.client.user.username;


	const guildlist = interaction.client.guilds.cache.map(guild => guild.name);
		return interaction.reply(botname + ' was written by Christian Acord and Corey Murphy.  It was originally forked from sitepoint-editors/discord-bot-sitepoint.  Current iteration supports basic sing-word commands such as ping and about. Feel free to contribute. It is installed on the following servers: ' + guildlist + '.');
	},
};