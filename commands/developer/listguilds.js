const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const { }  = require('discord.js');
const { TriviaGuild } = require('./../../classes/trivia/triviaGuild.js');
require('dotenv').config({ path: './../data/.env' });
const PLAYER_ROLE = process.env.PLAYER_ROLE;
const GUILD_CHAMPION_ROLE = process.env.GUILD_CHAMPION_ROLE;
const WORLD_CHAMPION_ROLE = process.env.WORLD_CHAMPION_ROLE;
const NOOB_ROLE = process.env.NOOB_ROLE;


module.exports = {
	data: new SlashCommandBuilder()
		.setName('listguilds')
		.setDescription('God-Mode!')
		.addStringOption(option =>
			option.setName('problems')
			.setDescription('Only Report Problem Guilds')
			.setRequired(false)
			.addChoices(
				{ name: 'True', value: 'true' },
				{ name: 'False', value: 'false' }
			)
		),
		
	async execute(interaction) {
		console.info('listguilds.js');
		await interaction.deferReply({ ephemeral: true });
		const authorizedUsers = ["515153941558984705"];
		const problems = interaction.options.getString('problems');

		if (!authorizedUsers.includes(interaction.user.id)) {
			await interaction.editReply({ content: "You are not authorized to use this command.", ephemeral: true });
			return;
		}



		const guilds = await interaction.client.guilds.cache;
		console.info("Guilds: " + guilds.size);
		let triviaGuilds = await this.getTriviaGuilds(guilds);
		triviaGuilds = await this.sortTriviaGuildsByScore(triviaGuilds, problems);
		console.info("Trivia Guilds: " + triviaGuilds.length);
		interaction.editReply("Here you go!");
		for (let i = 0; i < triviaGuilds.length; i++) {
			console.log(triviaGuilds[i].guild.name);
			let guildEmbed = await this.getGuildsEmbed(triviaGuilds[i]);
			await interaction.channel.send({ embeds: [guildEmbed] });
		}
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

	async sortTriviaGuildsByScore(triviaGuilds, problems) {
		for (let i = 0; i < triviaGuilds.length; i++) {
			console.log(triviaGuilds[i].guild.name);
			await triviaGuilds[i].checkGuildCriticalSetup();
			await triviaGuilds[i].setGuildTriviaUsers();
			await triviaGuilds[i].setGuildScore();
			if (problems == "true" && triviaGuilds[i].isReady) {
				triviaGuilds.splice(i, 1); // remove healthy guild from array
				i--;
			}
		}
		console.info('sortTriviaGuildsByScore');
		triviaGuilds.sort((a, b) => (a.totalScore < b.totalScore) ? 1 : -1);
		return triviaGuilds;
	},

	async getGuildsEmbed(triviaGuild) {
		console.info('getGuildsEmbed');
		let guildEmbed = new EmbedBuilder()
			.setDescription(triviaGuild.guild.id)
			.setColor('#0099ff')
			.setTimestamp();

		await triviaGuild.checkGuildCriticalSetup();
		await triviaGuild.setGuildTriviaUsers();
		await triviaGuild.setGuildScore();
		console.info("Guild: " + triviaGuild.guild.name + " - " + triviaGuild.totalScore);

		let triviaChannelName = "None";
		let channelInvite = "None";
		


		// check if channel is set
		if (triviaGuild.triviaChannel != null) {
			triviaChannelName = triviaGuild.triviaChannel.name;
		}

		// check if client has permission to create invite
		if (!triviaGuild.guild.members.me.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) {
			channelInvite = "No Permission";
		} else if (triviaGuild.triviaChannel == null) {
			channelInvite = "No Channel";
		} else {
			await triviaGuild.triviaChannel.createInvite({ unique: true, temporary: false }).then(invite => {
				console.log(invite.code);
				channelInvite = "https://discord.gg/" + invite.code;
				});
		}
		let triviaUsers = "0";
		if (triviaGuild.allGuildPlayers != null) {
			triviaUsers = triviaGuild.allGuildPlayers.length.toString();
		}

		if (triviaGuild.isReady) {
			guildEmbed.setTitle("✅ - " + triviaGuild.guild.name);
		} else {
			guildEmbed.setTitle("❌ - "  + triviaGuild.guild.name);
		}





		let rolesString = "";
		// check if guild has NOOB_ROLE
		if (triviaGuild.checkGuildRole(NOOB_ROLE)) {
			rolesString += "✅ - NOOB \n";
		} else {
			rolesString += "❌ - NOOB \n";
			
		}
		// check if guild has PLAYER_ROLE
		if (triviaGuild.checkGuildRole(PLAYER_ROLE)) {
			rolesString += "✅ - PLAYER \n";
		} else {
			rolesString += "❌ - PLAYER \n";
		}
		// check if guild has GUILD_CHAMPION_ROLE
		if (triviaGuild.checkGuildRole(GUILD_CHAMPION_ROLE)) {
			rolesString += "✅ - GUILD CHAMPION \n";
		} else {
			rolesString += "❌ - GUILD CHAMPION \n";
		}
		// check if guild has WORLD_CHAMPION_ROLE
		if (triviaGuild.checkGuildRole(WORLD_CHAMPION_ROLE)) {
			rolesString += "✅ - WORLD CHAMPION";
		} else {
			rolesString += "❌ - WORLD CHAMPION";
		}

		let guildPermissionsString = "";

		if (triviaGuild.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			guildPermissionsString += "✅ - Manage Roles \n";
		} else {
			guildPermissionsString += "❌ - Manage Roles \n";
		}

		if (triviaGuild.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
			guildPermissionsString += "✅ - Manage Channels \n";
		} else {
			guildPermissionsString += "❌ - Manage Channels \n";
		}


		guildEmbed.addFields(
			
			{ name: 'Guild Score', value: triviaGuild.totalScore.toString(), inline: true},
			{ name: 'Trivia Players', value: triviaUsers, inline: true },
			{ name: 'Members', value: triviaGuild.guild.memberCount.toString(), inline: true },
			{ name: "Trivia Channel", value: triviaChannelName, inline: false },
			{ name: "Invite Link", value: channelInvite, inline: true},
			{ name: 'Permissions', value: guildPermissionsString, inline: false },
			{ name: 'Roles', value: rolesString, inline: false } 
		);
		return guildEmbed;
	},
};