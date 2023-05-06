const { Events } = require('discord.js');
const { ChatGPTClient } = require('./../classes/chatGPT/ChatGPTClient.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
    console.info('messageCreate.js');
    
    // Ignore messages sent by other bots or by the bot itself
    if (message.author.bot) {
      console.log('messageCreate.js: message.author.bot');
      return;
    }

    // ignode messages not in the "chat-gpt" channel
    if (message.channel.name != "chat-gpt") {
      console.log('messageCreate.js: message.channel.name != "chat-gpt"');
      return;
    }

    console.log(`${message.author.username} sent a message!`);
    let chatGPTClient = new ChatGPTClient();
    chatGPTClient.addressMessage(message);
	},
};

/*
// Listen for messageCreate event
client.on('messageCreate', async (message) => {

    // Ignore messages sent by other bots or by the bot itself
    if (message.author.bot) {
      return;
    }
  
    // Get the channel object
    const channel = message.channel;
  
    // Check if the message was sent in a valid channel type
    if (channel.type !== 'GUILD_TEXT') {
      return;
    }
  
    // Check if the bot has permission to send messages in the channel
    if (!channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
      return;
    }
  
    // Get the text of the message
    const text = message.content;
  
    // You can put your OpenAI code here to generate a response based on the text
  
    // Send the response back in the same channel
    await channel.send(responseText);
  });*/