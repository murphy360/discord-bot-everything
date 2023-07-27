const { Events } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const { PermissionsBitField, EmbedBuilder }  = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const NOOB_ROLE = process.env.NOOB_ROLE;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const { SystemCommands } = require('./../classes/Helpers/systemCommands.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
        console.info('guildMemberAdd.js');
		const defaultChannel = member.guild.systemChannel;
		const helper = new SystemCommands();
		const devGuild = await member.client.guilds.fetch(DEV_GUILD_ID);
		const devChannel = await devGuild.channels.cache.find(channel => channel.name === 'trivia_bot');

		// Refresh the role cache
		await member.guild.roles.fetch();

		if (!await helper.createGuildRoles(member.guild)) {
			console.info(member.guild.name + ' is missing a role and can\'t properly onboard ' + member.user.username + '. Please check the logs.');
			return;
		} 

		// Check if role exists
		let noobRole = await member.guild.roles.cache.find(role => role.name === NOOB_ROLE);
        
		// Create role if it doesn't exist
		if (noobRole) {
			await member.roles.add(noobRole.id);
			console.info('Role added ' + noobRole.name + ' to ' + member.user.username);
		}

		const contextData = await helper.checkGuildCriticalSetup(member.guild);
		if (contextData.length > 0) {
			console.info('guildMemberAdd.js: Trying to onboard ' + member.user.username + ' in ' + member.guild.name + ' but they are missing some Critical Setups.');
			devChannel.send(member.guild.name + ' is missing some critical setups and can\'t properly onboard ' + member.user.username + '. Please check the logs.');
		} else {
			const triviaChannel = await member.guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
			const welcomeEmbed = await createWelcomeEmbed(member);
			triviaChannel.send({ embeds: [welcomeEmbed] });
		}
        
        async function createWelcomeEmbed(member) {
			// Function to create an about embed
			let welcomeEmbed = new EmbedBuilder()
				.setColor('#0099ff') // Blue
				.setTitle('Welcome to ' + member.guild.name + '!')
				.setDescription('This is a Trivia Bot. Start by using /trivia play to start a game of trivia. You will compete against members of your server and other servers in the world!')
				.addFields(
					{name: '/trivia play', value: 'All you need to play a single round of trivia'},
					{name: '/trivia play rounds:[ROUNDS] category:[CATEGORIES] difficulty:[DIFFICULTY]', value: 'Optionally specify the number of rounds, the categories, and the difficulty'},
					{name: '/trivia play custom_category:[CUSTOM_CATEGORY]', value: 'Optionally specify a custom category. I\'ll do my best to find questions that match your custom category.'},
				)
				.setThumbnail(member.guild.iconURL())
				.setTimestamp();
			return welcomeEmbed;
		}
	},
};