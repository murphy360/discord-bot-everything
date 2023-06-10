const { EmbedBuilder, Colors, Message, ChatInputCommandInteraction } = require('discord.js');
const { get } = require('http');
require('dotenv').config({ path: './../../data/.env' });
const { Configuration, OpenAIApi } = require("openai");
const { json } = require('sequelize');
const exampleReponse = "[{category:General Knowledge,difficulty:Easy,type:multiple,question:What is the capital city of Australia?,incorrect_answers:[Canberra,Sydney,Melbourne,Brisbane],correct_answer:Canberra,source:gpt-3.5-turbo},{category:General Knowledge,difficulty:Medium,type:boolean,question:The Great Wall of China is visible from space.,incorrect_answers:[True,False],correct_answer:False,source:gpt-3.5-turbo}]"
const exampleBadResponse = "[{category:Literature,difficulty:Easy,type:multiple,question:Who is the author of the Percy Jackson series?,incorrect_answers:[J.K. Rowling,Rick Riordan,Suzanne Collins],correct_answer:Rick Riordan,source:gpt-3.5-turbo},{category:Mythology,difficulty:Easy,type:multiple,question:Who is Percy Jackson's father in the series?,incorrect_answers:[Hades,Zeus,Poseidon],correct_answer:Poseidon,source:gpt-3.5-turbo},{category:Literature,difficulty:Easy,type:multiple,question:What is the name of the first book in the Percy Jackson series?,incorrect_answers:[The Lightning Thief,The Sea of Monsters,The Titan's Curse],correct_answer:The Lightning Thief,source:gpt-3.5-turbo},{category:Mythology,difficulty:Easy,type:multiple,question:What is the name of the camp where Percy Jackson trains?,incorrect_answers:[Camp Crystal Lake,Camp Half-Blood,Camp Jupiter],correct_answer:Camp Half-Blood,source:gpt-3.5-turbo},{category:Literature,difficulty:Easy,type:multiple,question:Who is Percy Jackson's best friend in the series?,incorrect_answers:[Annabeth Chase,Clarisse La Rue,Grover Underwood],correct_answer:Grover Underwood,source:gpt-3.5-turbo}]"


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

  async getImageUrl(prompt) {
    response = this.openai.Image.create(
      prompt,
      n=1,
      size="1024x1024"
    )
    image_url = response['data'][0]['url']
    return image_url;
  }

  async sendChangeLog(string, channel) {
    let changelogContextData = [{ role: 'system', content: 'You are a creative technical writer tasked to write changelogs based on git commits.  You are also a little snarky and like adding your own comments. Changelogs should report dates but not developer names' }];
    changelogContextData.push({
      role: 'user',
      content: 'Git log:  ' + string
    });
    console.info('ChatGPTClient.sendChangeLog');
    await this.sendChatCompletion(changelogContextData, channel); 
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
    console.info("CONTEXT DATA: " + contextData);
    await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: contextData,

      })
      .then((result) => {
        console.info("sendChatCompletion.then");
        try {
          const responseText = result.data.choices[0].message.content.toString();
          
    
          channel.send(responseText);
        } catch (error) {
          console.error(error);
        }
        })
        .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
    });
  }

  async getTriviaQuestions(numberQuestions, category, difficulty,) {
    const model = 'gpt-3.5-turbo';
    console.info('ChatGPTClient.getTriviaQuestions() - numberQuestions: ' + numberQuestions + ' category: ' + category + ' difficulty: ' + difficulty);
    //const exampleReponse = "[{\"category\":\"General Knowledge\",\"difficulty\":\"Easy\",\"type\":\"multiple\",\"question\":\"What is the capital city of Australia?\",\"choices\":[\"Canberra\",\"Sydney\",\"Melbourne\",\"Brisbane\"],\"correct_answer\":\"Canberra\",\"source\":\"gpt-3.5-turbo\"},{\"category\":\"General Knowledge\",\"difficulty\":\"Medium\",\"type\":\"boolean\",\"question\":\"The Great Wall of China is visible from space.\",\"choices:\"[\"True\",\"False\"],\"correct_answer\":\"False\",\"source\":\"gpt-3.5-turbo\"}]"

    let triviaContextData = [];
    triviaContextData.push({
         role: 'system', 
         content: 'You are a trivia Host, it is your job to choose awesome trivia questions for your audience. Do your best to ensure a wide variety of questions.  ',
    });
    triviaContextData.push({
      role: 'user',
      content: 'Generate ' + numberQuestions + ' trivia questions related to ' + category + ' and a difficulty of ' + difficulty + ' For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers, correct_answer, and source (' + model + ' )"). Return the questions as a single-line, minified JSON string: ' + exampleReponse,
    });
    
    
    return await this.getMinifiedJsonFromAi(model, triviaContextData);

    
  }

  async getMinifiedJsonFromAi(model, triviaContextData) {
    console.info('ChatGPTClient.getMinifiedJsonFromAi()');
    let jsonString = null;
    let json = null;
    await this.openai.createChatCompletion({
      model: model,
      messages: triviaContextData,
      temperature: 0.5, // adjust this value to control the amount of randomness in the response

      })
      .then((result) => {
        
        try {
          const responseText = result.data.choices[0].message.content.toString();
          console.log('Response Text: ' + responseText);
          jsonString = responseText;
          //jsonString = JSON.stringify(responseText);
          //console.log('JSON String: ' + jsonString);
          
        } catch (error) {
          console.error('RESPONSE TEXT ERROR: ' + error);
        }

        })
        .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
    });
    try {
      // remove everything before the first '['
      jsonString = jsonString.substring(jsonString.indexOf('['));
      console.info('JSON String ' + jsonString);
      json = JSON.parse(jsonString); 
      console.info('JSON Question Length: ' + json.length)
      console.log(json);
      console.info('JSON Question: ' + json[0].question); // output: "JSON Question: What is the oldest continuous seagoing service in the United States?"
      
      
      // remove "'" from the string
      jsonString = jsonString.replace(/\\/g, "");
      console.info('JSON Clean String ' + jsonString);

      json = JSON.parse(jsonString); 
      console.info('JSON Question Length: ' + json.length)
      console.log(json);
      console.info('JSON Question: ' + json[1].question); // output: "JSON Question: What is the oldest continuous seagoing service in the United States?"
      
      for (let i = 0; i < json.length; i++) {
        // check if correct_answer is in incorrect_answers
        if (json[i].incorrect_answers.includes(json[i].correct_answer)) {
          console.info('removing correct_answer from incorrect_answers ' + json[i].incorrect_answers.length);
          json[i].incorrect_answers.splice(json[i].incorrect_answers.indexOf(json[i].correct_answer), 1); // remove correct_answer from incorrect_answers
          console.info('incorrect_answers ' + json[i].incorrect_answers.length);
        }
        // if json[i].incorrect_answers is 4 items long, remove the last item
        if (json[i].incorrect_answers.length == 4) {
          console.info('removing last item from incorrect_answers ' + json[i].incorrect_answers.length);
          json[i].incorrect_answers.splice(3, 1); // remove last item from incorrect_answers
          console.info('incorrect_answers ' + json[i].incorrect_answers.length);
        }
        // ensure json includes type
        if (!json[i].type && json[i].incorrect_answers.length > 1) { // if type is not defined and incorrect_answers is more than 1 item
          console.info('adding type to json');
          json[i].type = 'multiple';
        } else if (!json[i].type && json[i].incorrect_answers.length == 1) { // if type is not defined and incorrect_answers is 1 item
          console.info('adding type to json');
          json[i].type = 'boolean';
        }
      }
      console.info('JSON is valid on first pass');
      return json;
    } catch (error) {
      console.error("ERROR: " + error);
      
      triviaContextData.push({
        role: 'user',
        content: 'I got this error while using JSON.parse() on the last response: ' + error + ': can you try again?',
      });

      return await this.getMinifiedJsonFromAi(model, triviaContextData);
    }
  }

  // strip all text not in json format from a string
  
  getJSONFromString(str) {
    console.info("getJSONFromString()");
    let jsonStringArray = str.split('```');
    console.info(jsonStringArray.length());
    jsonString = jsonStringArray[1];
    //jsonString = jsonString.replace(/(\r\n|\n|\r)/gm, "");
    console.info("jsonString");
    console.info(jsonString);
    return JSON.parse(jsonString);
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