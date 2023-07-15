const { Users } = require('./../../dbObjects.js');
const Sequelize = require('sequelize');
Sequelize.options.logging = console.log;
require('dotenv').config({ path: './../data/.env' });
const { ChatGPTClient } = require('./../chatGPT/ChatGPTClient.js');

const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;


class SystemCommands {


    constructor() {
          this.sendMessages = true;
          this.guildRoles = [];
          this.guildRoles.push(process.env.PLAYER_ROLE);
          this.guildRoles.push(process.env.NOOB_ROLE);
          this.guildRoles.push(process.env.WORLD_CHAMPION_ROLE);
          this.guildRoles.push(process.env.GUILD_CHAMPION_ROLE);
    }

    /**
     * 
     * @param {*} guild 
     * @returns contextData - an array of objects containing any setup issues with the guild
     * if contextData.length == 0 then the guild is setup correctly
     */
    async checkGuildSetup(guild) {
  
      let contextData = [];
      // Check if the bot has the required permissions
      console.info(guild.members.me.permissions.toArray());
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
        this.sendMessages = false;
        console.log('I do not have the SendMessages permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing SendMessages Permission'
          });
      } 

      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        console.log('I do not have the ManageChannels permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageChannels Permission'
          });
      } else {
        let triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
        if (!triviaChannel){
          await this.createTriviaChannel(guild);
        }
        triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
        if (!triviaChannel) {
          console.log('I do not have the ' + TRIVIA_CHANNEL + ' channel in ' + guild.name + '. Please create the channel and try again.');
          contextData.push({
            role: 'user',
            content: 'Missing ' + TRIVIA_CHANNEL + ' channel. Please create the channel and try again. '
          });
        } else {
          console.info('Checking permissions for ' + TRIVIA_CHANNEL + ' channel');
          const triviaChannelViewChannelPermission = await guild.members.me.permissionsIn(triviaChannel).has(PermissionsBitField.Flags.ViewChannel);
          if (!triviaChannelViewChannelPermission) {
             console.log('I do not have the View Channel Permission in the ' + TRIVIA_CHANNEL + ' channel in ' + guild.name + '. Please assign the View Channel permission to the bot and try again.');
              contextData.push({
                role: 'user',
                content: 'Missing View Channel Permission in ' + TRIVIA_CHANNEL + ' channel'
              });
          }
    
          const triviaChannelSendMessagesPermission = await guild.members.me.permissionsIn(triviaChannel).has(PermissionsBitField.Flags.SendMessages);
          if (!triviaChannelSendMessagesPermission) {
            console.log('I do not have the Send Messages Permission in the ' + TRIVIA_CHANNEL + ' channel in ' + guild.name + '. Please assign the Send Messages permission to the bot and try again.');
            contextData.push({
              role: 'user',
              content: 'Missing Send Messages Permission in ' + TRIVIA_CHANNEL + ' channel'
            });
          }

          const triviaChannelEmbedLinksPermission = await guild.members.me.permissionsIn(triviaChannel).has(PermissionsBitField.Flags.EmbedLinks);
          if (!triviaChannelEmbedLinksPermission) {
            console.log('I do not have the Embed Links Permission in the ' + TRIVIA_CHANNEL + ' channel in ' + guild.name + '. Please assign the Embed Links permission to the bot and try again.');
            contextData.push({
              role: 'user',
              content: 'Missing Embed Links Permission in ' + TRIVIA_CHANNEL + ' channel'
            });
          }

          const triviaChannelReadMessageHistoryPermission = await guild.members.me.permissionsIn(triviaChannel).has(PermissionsBitField.Flags.ReadMessageHistory);
          if (!triviaChannelReadMessageHistoryPermission) {
            console.log('I do not have the Read Message History Permission in the ' + TRIVIA_CHANNEL + ' channel in ' + guild.name + '. Please assign the Read Message History permission to the bot and try again.');
            contextData.push({
              role: 'user',
              content: 'Missing Read Message History Permission in ' + TRIVIA_CHANNEL + ' channel'
            });
          }
        }
      }

      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        console.log('I do not have the ManageRoles permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageRoles Permission'
          });
      } else {
        await this.createGuildRoles(guild);
              // Check Role Positions
        if (!await this.checkRolePositions(guild)) {
          console.log('Role positions are incorrect in ' + guild.name + '. Please assign the correct role positions to the bot and try again.');
          contextData.push({
            role: 'user',
            content: 'Incorrect Role Positions - Please make sure I have a higher position than the roles I am supposed to assign. (World Champion, Guild Champion, Player, Noob)'
        });
      }
      }

      // Add Reaction Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.AddReactions)) {
        console.log('I do not have the AddReactions permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing AddReactions Permission'	
          });
      }

      // Manage Events Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
        console.log('I do not have the ManageEvents permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageEvents Permission'
          });
      } 

      // Mention Everyone Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.MentionEveryone)) {
        console.log('I do not have the MentionEveryone permission in ' + guild.name + '. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing MentionEveryone Permission'
        });
      }
      return contextData;
    }
// Create Trivia Channel
    async createTriviaChannel(guild) {
      console.info('Creating ' + TRIVIA_CHANNEL + ' in ' + guild.name);
      let defaultChannel = guild.systemChannel;
      if (!defaultChannel) {
        console.info('No default channel in ' + guild.name + '. Please create a channel called ' + TRIVIA_CHANNEL + ' and try again.');
        return false;
      }
      let parentTextChannelId = defaultChannel.parentId;
      await guild.channels.create({
        name: TRIVIA_CHANNEL,
        type: 0,
        parent: parentTextChannelId
      }).then(async channel => {
        console.info('Trivia Channel Created: ' + channel.name + ' in ' + guild.name);
        channel.permissionOverwrites.set([
          {
            id: guild.id,
            allow: [PermissionsBitField.Flags.SendMessages],
          }, {
            id: guild.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          }, {
            id: guild.id,
            allow: [PermissionsBitField.Flags.ReadMessageHistory]
          }
        ]);
        return true;
      }).catch(async error => {
        console.info('Error creating Trivia Channel in ' + guild.name + ': ');
        console.error(error);
        return false;
      });
      
    }

    async checkTriviaChannel(guild) {
      const triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
      if (triviaChannel){
        return true;
      } else {
        return false;
      }
    }

    // Check if role exists in guild
    async checkRole(guild, roleName) {
      let role = await guild.roles.cache.find(role => role.name === roleName);
      if (role) {
        return true;
      } 
      return false;
    }

     // Create Guild Roles if they don't exist
    async createGuildRoles(guild) {
      const botMember = guild.members.cache.get(guild.client.user.id);
      const botRole = botMember.roles.highest;
      const botRolePosition = botRole.position;
      
      if (guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        if (!await this.checkRole(guild, process.env.WORLD_CHAMPION_ROLE)){
          await this.createRole(guild, process.env.WORLD_CHAMPION_ROLE, '#FFD700', true, botRolePosition-1 ); // World Champion Role - Gold - Hoisted - 103
        }
  
        if (!await this.checkRole(guild, process.env.GUILD_CHAMPION_ROLE)){
          await this.createRole(guild, process.env.GUILD_CHAMPION_ROLE, '#C0C0C0', true, botRolePosition-2); // Guild Champion Role - Silver - Hoisted - 102
        }
  
        if (!await this.checkRole(guild, process.env.PLAYER_ROLE)){
          await this.createRole(guild, process.env.PLAYER_ROLE, '#00ff00', true, botRolePosition-3); // Player Role - Green - Hoisted - 105
        }
  
        if (!await this.checkRole(guild, process.env.NOOB_ROLE)){
          await this.createRole(guild, process.env.NOOB_ROLE, '#964B00', true, botRolePosition-4); // Noob Role - Brown - Hoisted - 104
        }

        return true;
      } else {
        return false;
      }
     
    }

    // Check if role positions are correct
    async checkRolePositions(guild) {
      const botMember = guild.members.cache.get(guild.client.user.id);
      const botRole = await botMember.roles.highest;
      const worldChampionRole = await guild.roles.cache.find(role => role.name === process.env.WORLD_CHAMPION_ROLE);
      const guildChampionRole = await guild.roles.cache.find(role => role.name === process.env.GUILD_CHAMPION_ROLE);
      const playerRole = await guild.roles.cache.find(role => role.name === process.env.PLAYER_ROLE);
      const noobRole = await guild.roles.cache.find(role => role.name === process.env.NOOB_ROLE);
      const roles = [worldChampionRole, guildChampionRole, playerRole, noobRole];
      
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].position >= botRole.position) {
          return false;
        }
      }
      return true;
    }

    async createRole(guild, roleName, color, hoist, position) {
      // Create Player role
      console.info('Creating ' + roleName + ' role in ' + guild.name);
      await guild.roles.create({
        name: roleName,
        color: color,
        hoist: hoist,
        position: position,
      }).then(async role => {
        console.info(guild.name + ': Role ' + role.name + ' has been created in ' + guild.name);
      }).catch(async error => {
        console.info('Error creating ' + roleName + ' role in ' + guild.name + ': ');
        console.error(error);
      }); 
    }
    
    async introduceBotToGuild(guild, contextData) {

      contextData.push({
        role: 'system',
        content: 'You are a Funny, whimsicle and sometimes snarky Trivia Host chatbot. You can start a new game by listening for the /trivia play command followed by the number of rounds, the category (or custom_category), and the difficulty. Example: /trivia play rounds:Five category:General Knowledge difficulty:Medium. You can even define a custom category (instead of category) by listening for the /custom_category command. Example: /trivia play rounds:Fifteen custom_category:' + guild.name + '.  If a user thinks something is off with a question, they can hit the thumbs down emoji on any question and you will try to learn from it. You can also show users how they stack up against other players by listening for the /trivia leaderboard and /trivia leaderboard-guild commands. You will periodically schedule Trivia Games on your own, please encourage users to join in at any time.  You can assign them new roles as they interact with you over time.'
      });

      contextData.push({
        role: 'user',
        content: 'You have just been invited to join the ' + guild.name + ' discord server and this it the first time you are meeting the guild, please introduce yourself and explain how to interact with you and play trivia games via the slash commands.'
      });

      const chatGPTClient = new ChatGPTClient();
      let defaultChannel = guild.systemChannel;
      const devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
      const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot"); 
      // If the bot has permissions to send messages in the default channel, introduce itself
      const defaultChannelSendMessagesPermission = await guild.members.me.permissionsIn(defaultChannel).has(PermissionsBitField.Flags.SendMessages);
      const defaultChannelViewChannelPermission = await guild.members.me.permissionsIn(defaultChannel).has(PermissionsBitField.Flags.ViewChannel);
      
      console.info('I have SendMessages Permission in ' + guild.name + ' default channel: ' + defaultChannelSendMessagesPermission);
      console.info('I have ViewChannel Permission in ' + guild.name + ' default channel: ' + defaultChannelViewChannelPermission);

      if (defaultChannelSendMessagesPermission && defaultChannelViewChannelPermission) {
        console.info('Introducing myself to ' + guild.name + ' in ' + defaultChannel.name);
        await chatGPTClient.sendChatCompletion(contextData, defaultChannel, 'gpt-4');
       } else if (!defaultChannelViewChannelPermission) {
        console.info('I do not have permissions in ' + guild.name + ' to view channel: ' + defaultChannel.name + '. I can\'t introduce myself');
        devChannel.send('I do not have permissions in ' + guild.name + ' to view channel: ' + defaultChannel.name + '. I can\'t introduce myself');
      } else if (!defaultChannelSendMessagesPermission) {
        console.info('I do not have permissions in ' + guild.name + ' to send messages in channel: ' + defaultChannel.name + '. I can\'t introduce myself');
        devChannel.send('I do not have permissions in ' + guild.name + ' to send messages in channel: ' + defaultChannel.name + '. I can\'t introduce myself' );
      }
    }

    // We're not really exiting the guild anymore
    async reportErrorToGuild(guild, contextData, isNewGuild) {
      // This is run when the bot first joins a guild
      console.info('SystemCommands: reportErrorToGuild ' + guild.name);
			console.info(contextData);

      const devGuild = guild.client.guilds.cache.get(DEV_GUILD_ID);
      const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");  
      const botname = guild.client.user.username;
      
      contextData.push({
        role: 'system',
        content: 'You are a Funny, whimsicle and sometimes snarky Trivia Host Discord Bot called ' + botname + ' but you don\'t have all the permissions you need to run correctly.'
        });

      if (isNewGuild) {
        contextData.push({
          role: 'user',
          content: 'Please Introduce yourself to the ' + guild.name + ' discord server as if you were talking in their public introductions channel, explain that you are missing some permissions you need in order to work correctly and then list the missing permissions in bullet form.'
          });
      // This is run when a bot's permissions change later on
      } else {
        contextData.push({
          role: 'user',
          content: 'Please apologize to the  ' + guild.name + ' for bothering them, but you need to remind them that you do not have the required permissions to work properly and list the missing permissions in bullet form.'
          });
      }
      
      contextData.push({
        role: 'user',
        content: 'Invite link with correct permissions: https://discord.com/oauth2/authorize?client_id=828100639866486795&permissions=17601044621392&scope=bot'
        });

      contextData.push({
        role: 'user',
        content: 'An invite to your support Server is: https://discord.gg/cCyAkNwcR3'
      });
  
      /**
      const defaultChannel = guild.systemChannel;
      if (defaultChannel) {
        const defaultChannelSendMessagesPermission = await guild.members.me.permissionsIn(defaultChannel).has(PermissionsBitField.Flags.SendMessages);
        const defaultChannelViewChannelPermission = await guild.members.me.permissionsIn(defaultChannel).has(PermissionsBitField.Flags.ViewChannel);
        const defaultChannelSendEmbedLinksPermission = await guild.members.me.permissionsIn(defaultChannel).has(PermissionsBitField.Flags.EmbedLinks);
        if (defaultChannelSendMessagesPermission && defaultChannelViewChannelPermission && defaultChannelSendEmbedLinksPermission) {
          devChannel.send('Reporting Error to guild' + guild.name + 'in ' + defaultChannel.name + ' due to missing permissions ' + contextData.toString());
          console.log('Reporting Error to guild ' + guild.name + ' due to missing permissions in ' + defaultChannel.name + '. At least I can tell them I have a problem');

          const chatGPTClient = new ChatGPTClient();
          await chatGPTClient.sendChatCompletion(contextData, defaultChannel, 'gpt-4');
          return;
        }
      } 
       */
      devChannel.send('Reporting Error to guild ' + guild.name + ' due to missing permissions ' + contextData.toString());
      console.log('Reporting Error to guild ' + guild.name + ' due to missing permissions in default channel. I can\'t even tell them I have a problem');
      console.log(contextData);
    }

    		// Function to create an about embed
		async getHelpEmbedErrors(contextData, client) {
      console.info('SystemCommands: getHelpEmbedErrors');
      let botname = client.user.username;
			let helpEmbed = new EmbedBuilder()
				.setColor('#ff0000') // Red
				.setTitle('Help for ' + botname)
				.setDescription('This is a Trivia Bot. I have some setup issues I need you to fix before I can work properly. Please check the following things and try again:')
				.setThumbnail(client.user.displayAvatarURL())
				.setTimestamp();

			for (let i = 0; i < contextData.length; i++) {
				helpEmbed.addFields( { name: "Problem ", value: contextData[i].content } );
			}
			helpEmbed.addFields(
				{ name: "Invite link with correct permissions", value: 'https://discord.com/oauth2/authorize?client_id=828100639866486795&permissions=17601044621392&scope=bot' },
				{ name: "An invite to my support Server", value: 'https://discord.gg/8QZQ6XZ8' }
      );
			return helpEmbed;
		}

    async getChangeLog() {
        exec(git)
        async function sh(cmd) {
          return new Promise(function (resolve, reject) {
            exec(cmd, (err, stdout, stderr) => {
              if (err) {
                reject(err);
              } else {
                resolve({ stdout, stderr });
              }
            });
          });
        }
    }
}

module.exports.SystemCommands = SystemCommands;
