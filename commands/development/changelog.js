const { SlashCommandBuilder } = require('discord.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');
require('dotenv').config({ path: './../data/.env' });
const { exec } = require('child_process');

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('tells you what happened'),
	async execute(interaction) {
		console.info('develop.js');
		const guild = interaction.client.guilds.cache.find(g => g.id === DEV_GUILD_ID);

		const devChannel = await guild.channels.cache.find(channel => channel.name === "trivia_bot");
                

		exec('git log $(git describe --tags --abbrev=0)..HEAD', (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(stdout);
			let chatGPTClient = new ChatGPTClient();
			chatGPTClient.sendChangeLog(stdout, devChannel);

			});

		
	},
};