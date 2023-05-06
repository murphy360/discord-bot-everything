const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
        console.info('guildMemberAdd.js');
		const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
		if (!channel) return;
		channel.send(`Welcome to the server, ${member}`);
	},
};