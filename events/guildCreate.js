const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config({ path: './../data/.env' });

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const playerRoleName = process.env.PLAYER_ROLE;
const { ChatGPTClient } = require('./../classes/chatGPT/ChatGPTClient.js');

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {

		let devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
		let devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
		
        

		// Create embed for logging
        let embed = new EmbedBuilder()
            .setDescription('New Guild Joined')
            // Set the title of the field
            .setTitle(guild.name)
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setThumbnail(guild.iconURL())
            .setTimestamp()
		
		devChannel.send({ embeds: [embed] });    

		console.info(`Checking setups for + ${guild.name}`);
            

		guild.commands.set([]); // Clear the commands cache for this guild

		const defaultChannel = guild.systemChannel;
		parentTextChannelId = defaultChannel.parentId;
		let sufficientPermissions = true;
		let contextData = [];

		// Check if the bot has the required permissions
		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
			console.log('I do not have the SendMessages permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing SendMessages Permission'
			  });
		} 

		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
			console.log('I do not have the ManageChannels permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing ManageChannels Permission'
			  });
		} 

		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			console.log('I do not have the ManageRoles permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing ManageRoles Permission'
			  });
		}

		// Add Reaction Permissions
		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.AddReactions)) {
			console.log('I do not have the AddReactions permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing AddReactions Permission'	
			  });
		}

		// Manage Events Permissions
		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
			console.log('I do not have the ManageEvents permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing ManageEvents Permission'
			  });
		} 

		// Mention Everyone Permissions
		if (!guild.members.me.permissions.has(PermissionsBitField.Flags.MentionEveryone)) {
			console.log('I do not have the MentionEveryone permission. Please assign this permission to the bot and try again.');
			sufficientPermissions = false;
			contextData.push({
				role: 'user',
				content: 'Missing MentionEveryone Permission'
			  });
		}
		
		if (sufficientPermissions) {
			console.log('The bot has the required permissions in ' + guild.name);
			const triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
			if (!triviaChannel) {
				console.info('Trivia Channel Does Not Exist, creating it now');
				// Create Trivia Channel
				await guild.channels.create({
					name: TRIVIA_CHANNEL,
					type: 0,
					parent: parentTextChannelId,
				}).then(channel => {
					console.info('Trivia Channel Created: ' + channel.name);
				}).catch(async error => {
					console.error(error);
					await defaultChannel.send('Error creating Trivia Channel: I need to have a text channel called ' + TRIVIA_CHANNEL + ' to work properly. Please create one and try again. Or assign me the ManageChannels permission and I will create it for you.');
				});
			}

			 // Check if role exists
			 let playerRole = await guild.roles.cache.find(role => role.name === playerRoleName);
				
			 // Create role if it doesn't exist
			 if (!playerRole) {
				 
				 // Create Player role
				 await guild.roles.create({
					 name: playerRoleName,
					 color: '#00ff00', // Green
					 hoist: true,
					 position: 105,
				 }).then(async role => {
					 console.info(guild.name + ': Role ' + playerRoleName + ' does not exist, creating it now');
				 }).catch(async error => {
					 await defaultChannel.send('Error creating Player Role: I need to have a role called ' + playerRoleName + ' to work properly. Please create one and try again. Or assign me the ManageRoles permission and I will create it for you.');
				 }); 
			 }

			console.log("EVENTS FOR DEV GUILD");
	
			guild.scheduledEvents.fetch()
			// then log each event creator
			//.then(events => events.forEach(event => console.log(event)))
			.catch(console.error);
			
			contextData.push({
				role: 'user',
				content: 'Users can use slash commands to interact with you.  Try typing /trivia to see what you can do.'
			});

			contextData.push({
				role: 'user',
				content: 'Users can Select the number of rounds, the category and the difficulty of the questions.'
			});

			contextData.push({
				role: 'user',
				content: 'Users can define a custom category (instead of category) and you will try it\'s best to create questions for that category.'
			});

			contextData.push({
				role: 'user',
				content: 'If users think something is off with a question, they can hit the dislike button and you will try to learn from it.'
			});

			contextData.push({
				role: 'user',
				content: 'Users can use the LeaderBoard commands to see how they stack up against other players.'
			});

			contextData.push({
				role: 'user',
				content: 'It is important to explain to the users how to use slash commands.'
			});

			const chatGPTClient = new ChatGPTClient();
			await chatGPTClient.welcomeMessage(contextData, defaultChannel, 'gpt-4');

		} else {
			console.log('The bot does not have the required permissions in ' + guild.name);
			//await defaultChannel.send('I do not have the required permissions to work properly. Please assign the required permissions to the bot and invite me again!  https://discord.com/oauth2/authorize?client_id=828100639866486795&permissions=17601044621392&scope=bot');
			contextData.push({
				role: 'user',
				content: 'Please Introduce yourself to the server, explain the bot needs permissions, and then let the guild know you are going to leave, but happy to get invited back with correct permissions.'
			  });
			const chatGPTClient = new ChatGPTClient();
			await chatGPTClient.welcomeMessage(contextData, defaultChannel, 'gpt-4');
			// leave guild
			guild.leave();
		}
	},
  };