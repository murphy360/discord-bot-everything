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
		.setDescription('God-Mode!'),
		
	async execute(interaction) {
		console.info('listguilds.js');
		await interaction.deferReply({ ephemeral: true });
		const authorizedUsers = ["515153941558984705"];

		if (!authorizedUsers.includes(interaction.user.id)) {
			await interaction.editReply({ content: "You are not authorized to use this command.", ephemeral: true });
			return;
		}
		const guilds = await interaction.client.guilds.cache;
		console.info("Guilds: " + guilds.size);
		let triviaGuilds = await this.getTriviaGuilds(guilds);
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

	async getGuildsEmbed(triviaGuild) {
		console.info('getGuildsEmbed');
		let guildEmbed = new EmbedBuilder()
			.setDescription('Status of Don\'t Panic! in this guild.')
			.setColor('#0099ff')
			.setTimestamp();

		await triviaGuild.checkGuildCriticalSetup();
		await triviaGuild.setGuildTriviaUsers();

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

		let hasRolePerms = "False";
		if (triviaGuild.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			hasRolePerms = "True";
		}

		guildEmbed.addFields(
			{ name: triviaChannelName, value: channelInvite, inline: true },
			{ name: 'Members', value: triviaGuild.guild.memberCount.toString(), inline: true },
			{ name: 'Trivia Players', value: triviaUsers, inline: true },
			{ name: 'ManageRoles Permissions', value: hasRolePerms, inline: false },
		);

		// check if guild has NOOB_ROLE
		if (triviaGuild.checkGuildRole(NOOB_ROLE)) {
			guildEmbed.addFields( {name: "NR", value: "✅", inline: true} );
		} else {
			guildEmbed.addFields( {name: "NR", value: "❌", inline: true} );
		}
		// check if guild has PLAYER_ROLE
		if (triviaGuild.checkGuildRole(PLAYER_ROLE)) {
			guildEmbed.addFields( {name: "PR", value: "✅", inline: true} );
		} else {
			guildEmbed.addFields( {name: "PR", value: "❌", inline: true} );
		}
		// check if guild has GUILD_CHAMPION_ROLE
		if (triviaGuild.checkGuildRole(GUILD_CHAMPION_ROLE)) {
			guildEmbed.addFields( {name: "GR", value: "✅", inline: true} );
		} else {
			guildEmbed.addFields( {name: "GR", value: "❌", inline: true} );
		}
		// check if guild has WORLD_CHAMPION_ROLE
		if (triviaGuild.checkGuildRole(WORLD_CHAMPION_ROLE)) {
			guildEmbed.addFields( {name: "WR", value: "✅", inline: true} );
		} else {
			guildEmbed.addFields( {name: "WR", value: "❌", inline: true} );
		}
		return guildEmbed;
	},
};