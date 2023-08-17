const { SlashCommandBuilder, PermissionsBitField  } = require('discord.js');
const { Game } = require('./../../classes/trivia/game.js');
const { LeaderBoard } = require('./../../classes/trivia/leaderBoard.js');
const { LeaderBoardGuild } = require('./../../classes/trivia/leaderBoardGuild.js');
const { SystemCommands } = require('./../../classes/Helpers/systemCommands.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');

require('dotenv').config({ path: './../data/.env' });
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;

let game_in_progress = false;
const triviaCategories = [
    { name: 'General Knowledge', value: '9' },
    { name: 'Entertainment: Books', value: '10' },
    { name: 'Entertainment: Film', value: '11' },
    { name: 'Entertainment: Music', value: '12' },
    { name: 'Entertainment: Musicals & Theatres', value: '13' },
    { name: 'Entertainment: Television', value: '14' },
    { name: 'Entertainment: Video Games', value: '15' },
    { name: 'Entertainment: Board Games', value: '16' },
    { name: 'Entertainment: Japanese Anime & Manga', value: '31' },
    { name: 'Entertainment: Cartoon & Animations', value: '32' },
    { name: 'Entertainment: Comics', value: '29' },
    { name: 'Science & Nature', value: '17' },
    { name: 'Science: Computers', value: '18' },
    { name: 'Science: Mathematics', value: '19' },
    { name: 'Science: Gadgets', value: '30' },
    { name: 'Mythology', value: '20' },
    { name: 'Sports', value: '21' },
    { name: 'Geography', value: '22' },
    { name: 'History', value: '23' },
    { name: 'Politics', value: '24' },
    { name: 'Art', value: '25' },
    { name: 'Celebrities', value: '26' },
    { name: 'Animals', value: '27' },
    { name: 'Vehicles', value: '28' }
];

module.exports = {

    // This is the command data that will be used to register the command
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('A Trivia Game!')
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
                        { name: 'Fifteen', value: '15' }
                ))
                .addStringOption(option => 
                    option.setName('difficulty')
                    .setDescription('How Difficult?')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Easy', value: 'easy' },
                        { name: 'Medium', value: 'medium' },
                        { name: 'Hard', value: 'hard' }
                ))
                .addStringOption(option => 
                    option.setName('category')
                    .setDescription('What Category?')
                    .setRequired(false)
                    .addChoices(  
                        { name: 'General Knowledge', value: '9' },
                        { name: 'Entertainment: Books', value: '10' },
                        { name: 'Entertainment: Film', value: '11' },
                        { name: 'Entertainment: Music', value: '12' },
                        { name: 'Entertainment: Musicals & Theatres', value: '13' },
                        { name: 'Entertainment: Television', value: '14' },
                        { name: 'Entertainment: Video Games', value: '15' },
                        { name: 'Entertainment: Board Games', value: '16' },
                        { name: 'Entertainment: Japanese Anime & Manga', value: '31' },
                        { name: 'Entertainment: Cartoon & Animations', value: '32' },
                        { name: 'Entertainment: Comics', value: '29' },
                        { name: 'Science & Nature', value: '17' },
                        { name: 'Science: Computers', value: '18' },
                        { name: 'Science: Mathematics', value: '19' },
                        { name: 'Science: Gadgets', value: '30' },
                        { name: 'Mythology', value: '20' },
                        { name: 'Sports', value: '21' },
                        { name: 'Geography', value: '22' },
                        { name: 'History', value: '23' },
                        { name: 'Politics', value: '24' },
                        { name: 'Art', value: '25' },
                        { name: 'Celebrities', value: '26' },
                        { name: 'Animals', value: '27' },
                        { name: 'Vehicles', value: '28' }
                ))
                .addStringOption(option => 
                    option.setName('custom-category')
                    .setDescription('Custom Category?')
                    .setRequired(false)
                    ))              
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Shows the world leaderboard'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard-guild')
                .setDescription('Shows the guild leaderboard'))                 
        .addSubcommand(subcommand =>
            subcommand
                .setName('rules')
                .setDescription('Rules of the game')),

    // This is the function that will be called when the command is executed
	async execute(interaction) {

        const helper = new SystemCommands();
		const triviaGuild = new TriviaGuild(interaction.guild);
		await triviaGuild.checkGuildCriticalSetup();

        if (!triviaGuild.isReady) {
            const embed = await helper.getHelpEmbedErrors(triviaGuild.contextData, interaction.client);
            return interaction.reply({ embeds: [embed] });
        }         
        // Check which subcommand was called
        if (interaction.options.getSubcommand() === 'about') {
            return interaction.reply('This is a trivia game! Written by Corey Murphy');
        } else if (interaction.options.getSubcommand() === 'play') {
            
  

            console.info('Play Subcommand');
            let rounds = 1;
            let difficulty = 'all';
            let categoryName = 'All';
            let categoryValue = '0';

            // Check if the user provided a number of rounds
            if (interaction.options.getString('rounds')) {
                rounds = interaction.options.getString('rounds');
            }   

            // Check if the user provide a difficulty
            if (interaction.options.getString('difficulty')) {
                difficulty = interaction.options.getString('difficulty');
            }   

            // Check if the user provided a category
            if (interaction.options.getString('category')) {
                console.info('Category Provided');
                categoryValue = interaction.options.getString('category');
                const preDefinedCategory = triviaCategories.find(category => category.value === categoryValue);
             
                if (preDefinedCategory) {
                    console.log('Pre-Defined categoryName: ' + preDefinedCategory.name);
                    categoryName = preDefinedCategory.name;
                    
                } else {
                    console.log('Custom Category');
                }; 
            
          
            }
            // Check if the user provided a custom category
            if (interaction.options.getString('custom-category')) {
                categoryName = interaction.options.getString('custom-category');
                console.info('categoryName: ' + categoryName);
                categoryValue = 'custom';
            }

            // Get the user and guild that started the game (Hosts)
            const hostMember = interaction.member;
            const hostGuild = interaction.guild;

            if (game_in_progress === false) {

                  //Respond to hostMember
                interaction.reply(hostMember.user.username + ', OK! ' + rounds + ' rounds! Difficulty: ' + difficulty + ' New game coming up!').catch(error => {
                    console.log(console.error);
                    defaultChannel.send(' Error replying to hostMember: ' + error + ' Have you given me the message permissions?');
                });

                // find the trivia channel
                const triviaChannel = await hostGuild.channels.cache.find(channel => channel.name === 'trivia');

                const game = new Game(interaction.client, hostMember.user, hostGuild, rounds, difficulty, categoryValue, categoryName);
                await game.init();           
                game_in_progress = true;
                await game.play(30);
                game_in_progress = false;
                await game.end();
                console.info('game ' + game.ID + ' should be over Starting Leaderboard');
                const leaderboard = new LeaderBoard(interaction.client);            
                await leaderboard.setWorldTriviaChampionRole()
            } else {
                // Respond that a game is already in play
                return interaction.reply(hostMember.user.username + ', Sorry! a game is already in progress.  Check the Trivia Room!');
            }
          
        } else if (interaction.options.getSubcommand() === 'leaderboard') {
            console.info('World Leaderboard Subcommand client: ' + interaction.client.ID);
            let leaderBoard = new LeaderBoard(interaction.client);
            leaderBoard.postManualWorldLeaderBoard(interaction);
            return;
        } else if (interaction.options.getSubcommand() === 'leaderboard-guild') {
            console.info('Guild Leaderboard Subcommand client: ' + interaction.client.ID);
            let leaderBoard = new LeaderBoardGuild(interaction.client);
            leaderBoard.postManualGuildLeaderBoard(interaction);
            return;        
        } else if (interaction.options.getSubcommand() === 'rules') {
            return interaction.reply('This will be the rules!');
        }    
	},
};

