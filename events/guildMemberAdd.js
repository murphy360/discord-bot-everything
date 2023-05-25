const { Events } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });
const { PermissionsBitField }  = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
        console.info('guildMemberAdd.js');
		const defaultChannel = member.guild.systemChannel;
		const roleName = "Noob";

		console.info('Adding ' + member.user.username + ' to Guild: ' + member.guild.name + ' Default Channel: ' + defaultChannel.name + ' Role Name: ' + roleName);
		
		// Refresh the role cache
		await member.guild.roles.fetch();

		// print all role names
		console.info('Roles: ' + member.guild.roles.cache.map(role => role.name).join(', '));

        // Check if role exists
        let noobRole = await member.guild.roles.cache.find(role => role.name === roleName);
        
        // Create role if it doesn't exist
        if (!noobRole) {
            console.info('Role ' + roleName + ' Doesn\'t exist. Creating it.');
            await member.guild.roles.create({
				name: roleName,
				color: '#964b00', // Brown
				hoist: true,
				position: 100,
                
            }).then( async role => {
				console.info('Role ' + roleName + ' Should have been created');
				const triviaChannel = await member.guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
				console.info('Trivia Channel: ' + triviaChannel.name + ' Role Name: ' + role.name);
				
				await triviaChannel.permissionOverwrites.set([
					{
						id: role.id,
						allow: [
							PermissionsBitField.Flags.ViewChannel, 
							PermissionsBitField.Flags.UseApplicationCommands, 
							PermissionsBitField.Flags.AddReactions, 
							PermissionsBitField.Flags.ReadMessageHistory
						],
					},
				]);

				console.info('Default Channel: ' + defaultChannel.name);
				await defaultChannel.permissionOverwrites.set([
					{
						id: role.id,
						allow: [
							PermissionsBitField.Flags.ViewChannel,
							PermissionsBitField.Flags.UseApplicationCommands,
							PermissionsBitField.Flags.SendMessages, 
							PermissionsBitField.Flags.ReadMessageHistory
						],
					},
				]);
				
				await member.roles.add(role.id);
				console.info('Role added ' + role.name + ' to ' + member.user.username);
					
			}).catch(console.error);

        } else {
			// Role exists
			console.info('Role: ' + noobRole.name + ' exists');     
			// Add the role to the the Noob
			console.info('Adding role ' + noobRole.name + ' to ' + member.user.username);
			member.roles.add(noobRole.id);
			console.info('Role added ' + noobRole.name + ' to ' + member.user.username);
			defaultChannel.send(`Welcome to the server, ${member.user.username} I'm going to set you as a Noob until you do something interesting... good luck!`);
		}
			// print all role names
			console.info('Roles: ' + member.guild.roles.cache.map(role => role.name).join(', '));
	},
};