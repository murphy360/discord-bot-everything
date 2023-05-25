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

            if (DEV == "true"){
                console.info('DEV MODE - Skipping Greeting');
                return;
            } else {
                defaultChannel.send(greetings[Math.floor((Math.random()*greetings.length))]);
            }
        });        
    },
};