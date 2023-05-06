const { EmbedBuilder, Colors, Message, ChatInputCommandInteraction } = require('discord.js');
require('dotenv').config({ path: './../../data/.env' }) 
const { Configuration, OpenAIApi } = require("openai");
const develop = require('../../commands/development/develop');


/**
 * Class for creating a Discord.JS ChatGPTClient.
 */
class ChatGPTClient {
  contextData = [{ role: 'system', content: 'You are a friendly chatbot.' }];
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(this.configuration);
 

  /**
   * @param {string} openAIAPIKey Your OpenAI API Key.
   * @param {{contextRemembering:boolean, responseType: 'embed' | 'string', maxLength:number}} options `.contextRemembering` Whether to keep track of ongoing conversations for each user.
   */
  constructor() {
    console.info('ChatGPTClient.constructor()');
  }

  // Response to /develop command
  async askDevelopmentQuestion(interaction) {
    let developerContextData = [{ role: 'system', content: 'You are a friendly pair programmer. You are here to assist a developer with their coding.' }];
    const channel = interaction.channel;
    console.info('ChatGPTClient.askDevelopmentQuestion()');
    developerContextData = await this.gatherContextData(developerContextData, channel);
    await this.sendChatCompletion(developerContextData, channel); 

  }

  // address a message (used in chat-gpt channels)
  async addressMessage(message) {
    const channel = message.channel;
    console.info('ChatGPTClient.addressChannel()');
    console.info(message.content);
    let genericContextData = await this.gatherContextData(this.contextData, channel);
    await this.sendChatCompletion(genericContextData, channel);  
  }

  // send chat completion to a specific Channel.  Used by askDevelopmentQuestion() and addressMessage()
  async sendChatCompletion(contextData, channel) {
    await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: contextData,
      })
      .then((result) => {
      
      try {
        const responseText = result.data.choices[0].message.content.toString();
        console.log(responseText);
        
        channel.send(responseText);
      } catch (error) {
        console.error(error);
      }
      })
      .catch((error) => {
      console.log(`OPENAI ERR: ${error}`);
    });
  }

  // gather contextData from a specific Channel.  Used by askDevelopmentQuestion() and addressMessage()
  async gatherContextData(contextData, channel) {
    let prevMessages = await channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      console.info(msg.content);
      contextData.push({
      role: 'user',
      content: msg.content,
      });
    });
    return contextData;
  }

}


module.exports.ChatGPTClient = ChatGPTClient;