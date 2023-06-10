require('../colors.js');
require('../greetings.js');
require('dotenv').config({ path: './../data/.env' });
const { exec } = require('child_process');

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;
const DEV = process.env.DEV;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const playerRoleName = process.env.PLAYER_ROLE;

const { Events } = require ('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        try {
            require('./../deployCommands.js'); // Deploy slash commands
        } catch (error) {
            console.error(error);
        }

        client.guilds.cache.forEach(async (guild) => {
            triviaExists = false;
            chatGPTExists = false;
            parentTextChannelId="";
            generalChannelId="";
            
            console.info(`Checking setups for + ${guild.name}`);

            guild.commands.set([]); // Clear the commands cache for this guild

            const defaultChannel = guild.systemChannel;
            parentTextChannelId = defaultChannel.parentId;

            const triviaChannel = await guild.channels.cache.find(channel => channel.name === TRIVIA_CHANNEL);
            if (!triviaChannel) {
                console.info('Trivia Channel Does Not Exist, creating it now');
                guild.channels.create({
                    name: TRIVIA_CHANNEL,
                        type: 0,
                        parent: parentTextChannelId,
                    });
            } else {
                console.info('Trivia Channel Exists: ' + triviaChannel.name);
            }

            const chatChannel = await guild.channels.cache.find(channel => channel.name === CHAT_GPT_CHANNEL);
            if (!chatChannel) {
                console.info('Chat GPT Channel Does Not Exist, creating it now');
                guild.channels.create({
                    name: CHAT_GPT_CHANNEL,
                        type: 0,
                        parent: parentTextChannelId,
                    });
            } else {
                console.info('Chat GPT Channel Exists: ' + chatChannel.name);
            }

            if (guild.id == DEV_GUILD_ID){
                const devChannel = await guild.channels.cache.find(channel => channel.name === "trivia_bot");
                devChannel.send(greetings[Math.floor((Math.random()*greetings.length))]);
                exec('git log $(git describe --tags --abbrev=0)..HEAD', (err, stdout, stderr) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    console.log(stdout);
                    devChannel.send(`\`\`\`${stdout}\`\`\``);
                  });
            }
            
            // Check if role exists
            let playerRole = await guild.roles.cache.find(role => role.name === playerRoleName);
                    
            // Create role if it doesn't exist
            if (!playerRole) {
                console.info(guild.name + ': Role ' + playerRoleName + ' does not exist, creating it now');
                // Create Player role
                await guild.roles.create({
                    name: playerRoleName,
                    color: '#00ff00', // Green
                    hoist: true,
                    position: 105,
                }).then(async role => {
                    console.info(guild.name + ': Created role ' + role.name);
                }).catch(console.error); 
            }  else {
                console.info(guild.name + ': Checking if role ' + playerRoleName + ' exists');
            }
            
        });        
    },
};