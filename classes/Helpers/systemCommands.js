const { Users } = require('./../../dbObjects.js');
const Sequelize = require('sequelize');
Sequelize.options.logging = console.log;
require('dotenv').config({ path: './../data/.env' });
const { ChatGPTClient } = require('./../chatGPT/ChatGPTClient.js');

const { PermissionsBitField } = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const playerRoleName = process.env.PLAYER_ROLE;
class SystemCommands {


    constructor() {
                
    }

    async checkPermissions(guild) {
      console.info('Checking permissions for ' + guild.name);
      let contextData = [];
      // Check if the bot has the required permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
        console.log('I do not have the SendMessages permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing SendMessages Permission'
          });
      } 

      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        console.log('I do not have the ManageChannels permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageChannels Permission'
          });
      } 

      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        console.log('I do not have the ManageRoles permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageRoles Permission'
          });
      }

      // Add Reaction Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.AddReactions)) {
        console.log('I do not have the AddReactions permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing AddReactions Permission'	
          });
      }

      // Manage Events Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
        console.log('I do not have the ManageEvents permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing ManageEvents Permission'
          });
      } 

      // Mention Everyone Permissions
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.MentionEveryone)) {
        console.log('I do not have the MentionEveryone permission. Please assign this permission to the bot and try again.');
        contextData.push({
          role: 'user',
          content: 'Missing MentionEveryone Permission'
          });
      }

      return contextData;
    }

    async checkChannel(guild) {
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
    }

    async checkRole(guild) {
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
      await chatGPTClient.sendChatCompletion(contextData, defaultChannel, 'gpt-4');
    }

    async exitGuild(guild, contextData, isNewGuild) {
      // This is run when the bot first joins a guild
      console.info('SystemCommands: Exiting guild ' + guild.name + ' due to missing permissions');
			console.info(contextData);
      contextData.push({
        role: 'system',
        content: 'You are a Funny, whimsicle and sometimes snarky Trivia Host Discord Bot. You need to exit this discord server due to permission issues.'
        });
      if (isNewGuild) {
        contextData.push({
          role: 'user',
          content: 'Please Introduce yourself to the ' + guild.name + ' discord server as if you were talking in their public introductions channel, explain that you need permissions, and then let the guild know you are going to leave, but are happy to get invited back with correct permissions.'
          });
      // This is run when a bot's permissions change later on
      } else {
        contextData.push({
          role: 'user',
          content: 'Please apologize to the  ' + guild.name + ' discord server for leaving, you have enjoyed being part of their community, but you do not have the required permissions to work properly. Please remind them to give you the required permissions and to invite you back! '
          });
      }
      
      contextData.push({
        role: 'user',
        content: 'Your Invite link: https://discord.com/oauth2/authorize?client_id=828100639866486795&permissions=17601044621392&scope=bot'
        });

      const chatGPTClient = new ChatGPTClient();
      let defaultChannel = guild.systemChannel;
      await chatGPTClient.sendChatCompletion(contextData, defaultChannel, 'gpt-4');
      // leave guild
      guild.leave();
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
