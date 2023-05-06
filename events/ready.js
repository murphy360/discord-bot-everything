require('../colors.js');
require('../greetings.js');

const { Events } = require ('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        client.guilds.cache.forEach((guild) => {
            console.info(guild.name);
            triviaExists = false;
            chatGPTExists = false;
            textChannelId="";
            generalChannelId="";
            // TODO Remove this line in development.  For now we're just using the Discord Bot Development server
            //if (guild.name != "Discord Bot Development") return;
            // Iterate through the channels in the guild
            guild.channels.cache.forEach((channel) => {
                //Find the Text Channels (Parent ID of all text channels)
                if (channel.name == "Text Channels") {
                    //console.info(`Text Channels - ${channel.name} ${channel.type} ${channel.id}`);
                    textChannelId = channel.id;
                }
                // See if Trivia Channel Exists - if not create it
                if (channel.name == "trivia" && channel.type == 0) {
                    //console.info(` Trivia Exists- ${channel.name} ${channel.type} ${channel.id}`);
                    triviaExists = true;
                }

                // See if Chat GPT Channel Exists - if not create it
                if (channel.name == "chat-gpt" && channel.type == 0) {
                    //console.info(` Chat GPT Exists- ${channel.name} ${channel.type} ${channel.id}`);
                    chatGPTExists = true;
                }

            });  

            const defaultChannel = guild.systemChannel;
            defaultChannel.send(greetings[Math.floor((Math.random()*greetings.length))]);
            
            // Trivia Channel doesn't exist on this guild - create it
            if (!triviaExists){
                console.info(`Creating Trivia Channel + ${textChannelId}`);
                guild.channels.create({
                   name: "trivia",
                    type: 0,
                    parent: textChannelId,
                });
            }

            // Chat GPT Channel doesn't exist on this guild - create it
            if (!chatGPTExists){
                console.info(`Creating Chat GPT Channel + ${textChannelId}`);
                guild.channels.create({
                   name: "chat-gpt",
                    type: 0,
                    parent: textChannelId,
                });
            }
        });        
    },
};