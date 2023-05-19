const { SlashCommandBuilder } = require('discord.js');
const { ChatGPTClient } = require('../../classes/chatGPT/ChatGPTClient.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joke')
		.setDescription('Tell me a Joke!')
		.addSubcommand(subcommand =>
            subcommand
                .setName('tell')
                .setDescription('Tell a Joke')
                .addStringOption(option => 
                    option.setName('type')
                    .setDescription('What Kind of Joke?')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Pun', value: 'pun' },
                        { name: 'One-Liner', value: 'oneliner' },
                        { name: 'Knock-Knock', value: 'knockknock' }
                ))
                .addStringOption(option => 
                    option.setName('rating')
                    .setDescription('What Rating?')
                    .setRequired(false)
                    .addChoices(
                        { name: 'G', value: 'g' },
                        { name: 'PG', value: 'pg' },
                        { name: 'PG-13', value: 'pg13' },
                        { name: 'Edgy', value: 'edgy' }
                ))
                .addStringOption(option => 
                    option.setName('custom-category')
                    .setDescription('Custom Category?')
                    .setRequired(false)
                    )),
	async execute(interaction) {
		console.info('joke.js');
		const model = 'davinci';
		
		if (interaction.options.getSubcommand() === 'tell') {
            console.info('Tell Subcommand');
            
			const model = 'gpt-3.5-turbo';
			let numberJokes = 1;
            let jokeType = 'one-liner';
            let categoryName = 'All';
            let rating = 'PG-13';

            // Check if the user provided a number of rounds
            if (interaction.options.getString('rating')) {
                
                rating = interaction.options.getString('rating');
                console.info('Rating: ' + rating);
            }   

            // Check if the user provide a difficulty
            if (interaction.options.getString('type')) {
                jokeType = interaction.options.getString('type');
            }   
			// Check if the user provided a custom category
			if (interaction.options.getString('custom-category')) {
				console.log('Custom Category');
				categoryName = interaction.options.getString('custom-category');
				console.info('categoryName: ' + categoryName);
				
			}
			let chatGPTClient = new ChatGPTClient();
			chatGPTClient.tellJoke(interaction.channel, model, numberJokes, jokeType, categoryName, rating) 
			return interaction.reply('Sure... I\'ll tell you a joke.');
         
		
		}
            
	},
};