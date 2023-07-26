const { SlashCommandBuilder } = require('discord.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');
require('dotenv').config({ path: './../data/.env' });
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('tells you what happened'),
	async execute(interaction) {
		console.info('develop.js');
		let chatGPTClient = new ChatGPTClient();
		interaction.reply('Sure, hold on a minute...');

		fs.readFile('changelog.txt', 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				chatGPTClient.sendChangeLog(data, interaction.channel);
				return;
			}
			console.log(data);
			
			chatGPTClient.sendChangeLog(data, interaction.channel, 'gpt-4');
			});
		
	},
};