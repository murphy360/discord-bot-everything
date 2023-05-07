const { Events } = require('discord.js');
const { ChatGPTClient } = require('./../classes/chatGPT/ChatGPTClient.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
    
    // Ignore messages sent by other bots or by the bot itself
    if (message.author.bot) {
      return;
    }

    // ignore messages not in the "chat-gpt" channel
    if (message.channel.name != "chat-gpt") {
      return;
    }

    // All filters passed, send message to chatGPTClient
    let chatGPTClient = new ChatGPTClient();
    chatGPTClient.addressMessage(message);
	},
};