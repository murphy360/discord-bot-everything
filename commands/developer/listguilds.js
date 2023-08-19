const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const { }  = require('discord.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listguilds')
		.setDescription('God-Mode!'),
		
	async execute(interaction) {
		console.info('listguilds.js');

		const authorizedUsers = ["515153941558984705"];

		if (!authorizedUsers.includes(interaction.user.id)) {
			await interaction.reply({ content: "You are not authorized to use this command.", ephemeral: true });
			return;
		}

		const guilds = await interaction.client.guilds.cache;
		console.info("Guilds: " + guilds.size);
		let triviaGuilds = await this.getTriviaGuilds(guilds);
		console.info("Trivia Guilds: " + triviaGuilds.length);
		let guildEmbed = await this.getGuildsEmbed(triviaGuilds);
		await interaction.reply({ embeds: [guildEmbed] });
	},

	async getTriviaGuilds(guilds) {
		console.info('getTriviaGuilds');
		let triviaGuilds = [];
		await guilds.forEach(async (guild) => {
			console.log(guild.name);
			const triviaGuild = new TriviaGuild(guild);
			triviaGuilds.push(triviaGuild);
			console.log(triviaGuilds.length);
		});
	return triviaGuilds;
	},

	async getGuildsEmbed(triviaGuilds) {
		console.info('getGuildsEmbed');
		let guildEmbed = new EmbedBuilder()
			.setTitle('Guilds')
			.setDescription('List of guilds the bot is in')
			.setColor('#0099ff')
			.setTimestamp();

		console.log(triviaGuilds.length);
		let guildString = "";

		for (let i = 0; i < triviaGuilds.length; i++) {
			await triviaGuilds[i].checkGuildCriticalSetup();
			await triviaGuilds[i].setGuildTriviaUsers();
			console.log(triviaGuilds[i].guild.name);
			let triviaChannelName = "None";
			let channelInvite = "None";

			// check if channel is set
			if (triviaGuilds[i].triviaChannel != null) {
				triviaChannelName = triviaGuilds[i].triviaChannel.name;
			}

			// check if client has permission to create invite
			if (!triviaGuilds[i].guild.members.me.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) {
				channelInvite = "No Permission";
			} else if (triviaGuilds[i].triviaChannel == null) {
				channelInvite = "No Channel";
			} else {
				await triviaGuilds[i].triviaChannel.createInvite({ unique: true, temporary: false }).then(invite => {
					console.log(invite.code);
					channelInvite = "https://discord.gg/" + invite.code;
				  });
			}
			let triviaUsers = "0";
			if (triviaGuilds[i].allGuildPlayers != null) {
				triviaUsers = triviaGuilds[i].allGuildPlayers.length.toString();
			}

			if (triviaGuilds[i].isReady) {
				guildString += "✅ - " + triviaGuilds[i].guild.name + "\n";
			} else {
				guildString += "❌ - " + triviaGuilds[i].guild.name + "\n";
			}
			guildString += "Channel: " + triviaChannelName + "\n";
			guildString += "Invite: " + channelInvite + "\n";
			guildString += "Members: " + triviaGuilds[i].guild.memberCount.toString() + "\n";
			guildString += "Trivia Players: " + triviaUsers + "\n";
			guildString += "\n";
			

		}

		guildEmbed.addFields(
			{ name: "Guilds", value: guildString, inline: false },
		);
		return guildEmbed;
	},
};