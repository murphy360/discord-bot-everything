const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder }  = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('All about the bot!'),
		
	async execute(interaction) {
		console.info('about.js');
		const client = interaction.client;
		const botname = client.user.username;

		const embed = await aboutEmbed();
		return interaction.reply({ embeds: [embed] });
		
		// Function to create an about embed
		async function aboutEmbed() {
			let aboutEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('About ' + botname)
				.setDescription('This is a Trivia Bot. We are actively adding new features! Try /trivia play to start a game!')
				/**
				.addFields(
					{name: 'Docker Hub', value: 'https://hub.docker.com/r/murphy360/everythingbot'},
					{name: 'GitHub', value: 'https://github.com/murphy360/discord-bot-everything'}
				)
				 */
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setTimestamp();
			return aboutEmbed;
		}
	},
};