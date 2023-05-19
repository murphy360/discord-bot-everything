const { Events } = require('discord.js');
const { ChatGPTClient } = require('./../classes/chatGPT/ChatGPTClient.js');
require('dotenv').config({ path: './../../data/.env' });
const CHAT_GPT_CHANNEL = process.env.CHAT_GPT_CHANNEL;

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
    
    // Ignore messages sent by other bots or by the bot itself
    if (message.author.bot) {
      return;
    }

    // ignore messages not in the "chat-gpt" channel
    if (message.channel.name != CHAT_GPT_CHANNEL) {
      return;
    }

    // All filters passed, send message to chatGPTClient
    let chatGPTClient = new ChatGPTClient();
    chatGPTClient.addressMessage(message);
	},
};