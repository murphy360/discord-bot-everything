require('../colors.js');
require('../greetings.js');
require('dotenv').config({ path: './../data/.env' });

const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;
const DEV = process.env.DEV;

const { Events } = require ('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        try {
            require('./../deployCommands.js');
        } catch (error) {
            console.error(error);
        }

        client.guilds.cache.forEach((guild) => {
            triviaExists = false;
            chatGPTExists = false;
            parentTextChannelId="";
            generalChannelId="";
            

           
            // This updates immediately
            guild.commands.set([]);
           
            console.info(`Checking setups for + ${guild.name}`);
            console.info('Trivia Channel: ' + TRIVIA_CHANNEL);
            console.info('Chat GPT Channel: ' + CHAT_GPT_CHANNEL);
            const defaultChannel = guild.systemChannel;
            parentTextChannelId = defaultChannel.parentId;

            // Iterate through the channels in the guild
            guild.channels.cache.forEach((channel) => {
                
                // See if Trivia Channel Exists - if not create it
                if (channel.name == TRIVIA_CHANNEL && channel.type == 0) {
                    triviaExists = true;
                }

                // See if Chat GPT Channel Exists - if not create it
                if (channel.name == CHAT_GPT_CHANNEL && channel.type == 0) {
                    chatGPTExists = true;
                }
            });  

            if (DEV == "true"){
                console.info('DEV MODE - Skipping Greeting');
                return;
            } else {
                defaultChannel.send(greetings[Math.floor((Math.random()*greetings.length))]);
            }
            
            
            // Trivia Channel doesn't exist on this guild - create it
            if (!triviaExists){
                console.info(`Creating Trivia Channel + ${parentTextChannelId}`);
                guild.channels.create({
                   name: TRIVIA_CHANNEL,
                    type: 0,
                    parent: parentTextChannelId,
                });
            }

            // Chat GPT Channel doesn't exist on this guild - create it
            if (!chatGPTExists){
                console.info(`Creating Chat GPT Channel + ${parentTextChannelId}`);
                guild.channels.create({
                   name: CHAT_GPT_CHANNEL,
                    type: 0,
                    parent: parentTextChannelId,
                });
            }
        });        
    },
};