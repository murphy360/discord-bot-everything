const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Timer } = require('./../../classes/timer.js');
const { Game } = require('./../../classes/game.js');

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

            // Get the user and guild that started the game (Hosts)
            const hostMember = interaction.member;
            const hostGuild = interaction.guild;

            const game = new Game(interaction.client, interaction.member, interaction.guild, rounds, difficulty, category);
            game.intro();
            

            //Respond to hostMember
            return interaction.reply(hostMember.displayName + ', OK! ' + rounds + ' rounds! Difficulty: ' + difficulty + ' New game coming up!');

        } else if (interaction.options.getSubcommand() === 'leaderboard') {
            return interaction.reply('This will be the leaderboard!');
        } else if (interaction.options.getSubcommand() === 'rules') {
            return interaction.reply('This will be the rules!');
        }    
	},
};