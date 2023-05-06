const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Replies with Random Cat!'),
	async execute(interaction) {
    console.info('cat.js');
    //interaction.reply('Random Cat Inbound!');
    //Test Commit
    //Fetch a random cat from the API and send it as a reply

    const attachment = new AttachmentBuilder('https://placekitten.com/200/300'); //ex. https://picsum.photos/200/300.jpg

    interaction.reply({ content: "I sent you a photo!", files: [attachment] });
	},
};

