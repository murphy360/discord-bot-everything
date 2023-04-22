const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

    // This is the command data that will be used to register the command
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('A Trivia Game!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('about')
                .setDescription('About our game'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play the game')
                .addStringOption(option => 
                    option.setName('rounds')
                    .setDescription('How Many Rounds?')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Five', value: '5' },
                        { name: 'Ten', value: '10' },
                        { name: 'Fifteen', value: '15' },
                ))
                .addStringOption(option => 
                    option.setName('difficulty')
                    .setDescription('How Difficult?')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Easy', value: 'easy' },
                        { name: 'Medium', value: 'medium' },
                        { name: 'hard', value: 'hard' },
                )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Will show the leaderboard... Someday'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rules')
                .setDescription('Rules of the game')),

    // This is the function that will be called when the command is executed
	async execute(interaction) {
        // Check which subcommand was called
        if (interaction.options.getSubcommand() === 'about') {
            return interaction.reply('This is a trivia game! Written by Corey Murphy');
        } else if (interaction.options.getSubcommand() === 'play') {

            const rounds = 5;
            const difficulty = 'medium';
            const category = 'all';

            // Check if the user provided a number of rounds
            if (interaction.options.getString('rounds')) {
                rounds = interaction.options.getString('rounds');
            }   

            // Check if the user provide a difficulty
            if (interaction.options.getString('difficulty')) {
                difficulty = interaction.options.getString('difficulty');
            }   

            // Get the user that started the game
            const target = interaction.member;
            console.info('initiating player: ' + target.displayName);
            // Get the Guild object of the guild the command was sent in
            const originGuild = interaction.guild;
            console.info('ICON: ' + originGuild.iconURL());

            interaction.client.guilds.cache.forEach((guild) => {
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia")
                
                const embed = new EmbedBuilder()
                // Set the title of the field
                .setTitle('New Game!')
                // Set the color of the embed
                .setColor(0x0066ff)
                // Set the main content of the embed
                .setDescription('A new game has started!')
                // Add originGuild icon to embedd
                .setThumbnail(interaction.guild.iconURL())
                .addFields(
                    { name: 'Host', value: target.displayName, inline: true  },
                    { name: 'Host Guild', value: originGuild.name, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Rounds', value: rounds.toString(), inline: true },
                    { name: 'Category', value: category, inline: true },
                    { name: 'Difficulty', value: difficulty, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: 'Trivia Game', iconURL: originGuild.iconURL() });
                // Send the embed to the trivia channel
                channel.send({ embeds: [embed] });  
            });
            


            return interaction.reply(target.name + ' wants to play ' + rounds + ' rounds! Difficulty: ' + difficulty + '!');

        } else if (interaction.options.getSubcommand() === 'leaderboard') {
            return interaction.reply('This will be the leaderboard!');
        } else if (interaction.options.getSubcommand() === 'rules') {
            return interaction.reply('This will be the rules!');
        }    
	},
};