const { SlashCommandBuilder } = require('discord.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('develop')
		.setDescription('helps you build things!'),
	async execute(interaction) {
        console.info('develop.js');

        let chatGPTClient = new ChatGPTClient();
        chatGPTClient.askDevelopmentQuestion(interaction);

		
	},
};