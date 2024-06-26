const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder }  = require('discord.js');
const { SystemCommands } = require('./../../classes/Helpers/systemCommands.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');
require('dotenv').config({ path: './../data/.env' });
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('How to use the bot!'),
		
	async execute(interaction) {
		console.info('help.js');
		// Defer Reply
		await interaction.deferReply();

		const client = interaction.client;
		const botname = client.user.username;
		const guild = interaction.guild;
		
		const helper = new SystemCommands();
		const triviaGuild = new TriviaGuild(guild);
		await triviaGuild.getGuildTriviaChannel();
		await triviaGuild.checkGuildCriticalSetup();
		const contextData = triviaGuild.contextData;

		if (contextData.length > 0) {
			console.log('help.js: trying to explain to these fools in ' + guild.name + ' that they need permissions.');
			let helpString = 'I\'m sorry, but I don\'t have everything I need to work properly. Please check the following things and try again: \n';
			  
			for (let i = 0; i < contextData.length; i++) {
				helpString += contextData[i].content + '\n';
			}

			const embed = await helper.getHelpEmbedErrors(contextData, client);
			return interaction.editReply({ embeds: [embed] });
		} 

		const embed = await helpEmbed();
		return interaction.editReply({ embeds: [embed] });
		
		// Function to create an about embed
		async function helpEmbed() {
			let helpEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Help for ' + botname)
				.setDescription('This is a Trivia Bot. Start by using /trivia play to start a game of trivia. You will compete against members of your server and other servers in the world!')
				.addFields(
					{name: '/trivia play', value: 'All you need to play a single round of trivia'},
					{name: '/trivia play rounds:[ROUNDS] category:[CATEGORY] difficulty:[DIFFICULTY]', value: 'Optionally specify the number of rounds, the categories, and the difficulty'},
					{name: '/trivia play custom_category:[CUSTOM_CATEGORY]', value: 'Optionally specify a custom category. I\'ll do my best to find questions that match your custom category.'},
					{name: '/set-channel:[CHANNEL-NAME]', value: 'ADMIN ONLY: Set the channel where I will send trivia questions. This is required to play trivia.'},
					{name: '/question add:[question] [answer]', value: 'Add a question to the database. This is a great way to help me grow!'}
				)
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setTimestamp();
			return helpEmbed;
		}	
	},
};