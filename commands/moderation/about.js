const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder }  = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('All about the bot!'),
		
	async execute(interaction) {
		console.info('about.js');

		const client = interaction.client;
		const botname = client.user.username;
		const developerGuild = client.guilds.cache.get('828303498994647130'); // Broken Developer Bot Server
		const devRole = developerGuild.roles.cache.get('1103303046131367976'); // Developer Role
		console.info('fetch guild members')
		await developerGuild.members.fetch();
		const embed = await aboutEmbed();
		
		const role = developerGuild.roles.cache.find(role => role.name === 'Developer');
		const members = role.members.map(member => member.user.tag);
		console.info(members);



		return interaction.reply({ embeds: [embed] });
		
		// Function to create an about embed
		async function aboutEmbed() {
			let aboutEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('About ' + botname)
				.setDescription('This is an everythingbot. We are working on making it do everything. Currently it does a bit of trivia')
				.addFields(
					{name: 'Docker Hub', value: 'https://hub.docker.com/r/murphy360/everythingbot'},
					{name: 'GitHub', value: 'https://github.com/murphy360/discord-bot-everything'}
				)
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setTimestamp();

				//print length of devRole.members
				console.info(devRole.members.length);

				devRole.members.forEach(developer => {
					console.info(developer.user.username);
				});
			
				devRole.members.forEach(developer => {
					aboutEmbed.addFields({name: 'Developer', value: developer.user.username, inline: true});
				});
			return aboutEmbed;
		}
	},
};