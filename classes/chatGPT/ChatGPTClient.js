const { EmbedBuilder, Colors, Message, ChatInputCommandInteraction } = require('discord.js');
require('dotenv').config({ path: './../../data/.env' }) 
const { Configuration, OpenAIApi } = require("openai");


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
    
 
  }

  async addressMessage(message) {
    const channel = message.channel;
    console.info('ChatGPTClient.addressChannel()');
    console.info(message.content);
    let prevMessages = await channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      console.info(msg.content);
      this.contextData.push({
      role: 'user',
      content: msg.content,
      });
    });

    const result = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: this.contextData,
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

}


module.exports.ChatGPTClient = ChatGPTClient;