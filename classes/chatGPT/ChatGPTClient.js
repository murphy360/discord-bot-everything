const { EmbedBuilder, Colors, Message, ChatInputCommandInteraction } = require('discord.js');
const { get } = require('http');
require('dotenv').config({ path: './../../data/.env' }) 
const { Configuration, OpenAIApi } = require("openai");
const { json } = require('sequelize');
const exampleTriviaResponse = "[{category:General Knowledge,difficulty:Easy,type:multiple,question:What is the capital city of Australia?,incorrect_answers:[Canberra,Sydney,Melbourne,Brisbane],correct_answer:Canberra,source:gpt-3.5-turbo},{category:General Knowledge,difficulty:Medium,type:boolean,question:The Great Wall of China is visible from space.,incorrect_answers:[True,False],correct_answer:False,source:gpt-3.5-turbo}]"
const exampleJokeResponse = "[{setup:Why did the lifeguard kick the elephants out of the pool?, punchline:Because they kept dropping their trunks!,type:pun,category:animal,rating:PG-13,source:GPT 3.5 turbo},{setup:What did the swim coach say to the boy who was afraid of the water?, punchline:Just dive in!,type:pun,category:sports,rating:PG-13,source:GPT 3.5 turbo},{setup:Why don't oysters share their pearls? Because they're shellfish!,type:pun,category:ocean,rating:PG-13,source:GPT 3.5 turbo},{setup:What do you call a fish that wears a bowtie?, punchline:Sofishticated!,type:pun,category:fish,rating:PG-13,source:GPT 3.5 turbo},{setup:Why can't you hear a pterodactyl go to the bathroom?, punchline:Because the pee is silent!,type:pun,category:prehistoric,rating:PG-13,source:GPT 3.5 turbo}]"
const exampleBadResponse = "[{category:Literature,difficulty:Easy,type:multiple,question:Who is the author of the Percy Jackson series?,incorrect_answers:[J.K. Rowling,Rick Riordan,Suzanne Collins],correct_answer:Rick Riordan,source:gpt-3.5-turbo},{category:Mythology,difficulty:Easy,type:multiple,question:Who is Percy Jackson's father in the series?,incorrect_answers:[Hades,Zeus,Poseidon],correct_answer:Poseidon,source:gpt-3.5-turbo},{category:Literature,difficulty:Easy,type:multiple,question:What is the name of the first book in the Percy Jackson series?,incorrect_answers:[The Lightning Thief,The Sea of Monsters,The Titan's Curse],correct_answer:The Lightning Thief,source:gpt-3.5-turbo},{category:Mythology,difficulty:Easy,type:multiple,question:What is the name of the camp where Percy Jackson trains?,incorrect_answers:[Camp Crystal Lake,Camp Half-Blood,Camp Jupiter],correct_answer:Camp Half-Blood,source:gpt-3.5-turbo},{category:Literature,difficulty:Easy,type:multiple,question:Who is Percy Jackson's best friend in the series?,incorrect_answers:[Annabeth Chase,Clarisse La Rue,Grover Underwood],correct_answer:Grover Underwood,source:gpt-3.5-turbo}]"
const chatModel = 'gpt-3.5-turbo';

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
          
    
          channel.send(responseText);
        } catch (error) {
          console.error(error);
        }
        })
        .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
    });
  }

  async tellJoke(channel, model, numberJokes, jokeType, categoryName, rating) {
    return new Promise(async (resolve, reject) => {
      console.info('ChatGPTClient.tellJoke()');

      const jokeJson = await this.getJokes(model, numberJokes, jokeType, categoryName, rating);
      console.info('ChatGPTClient.tellJoke() - got jokes');
      console.log(jokeJson);
      const embed = new EmbedBuilder()
        // Set the title of the field
        .setTitle(jokeJson[0].setup)
        // Set the color of the embed
        .setColor(0x0066ff)
        // Set the main content of the embed
        .setDescription(jokeJson[0].punchline)
        // Add originGuild icon to embedd
        //.setThumbnail(this.hostGuild.iconURL())
        .addFields(
            { name: 'Type', value: jokeJson[0].type, inline: true },
            { name: 'Category', value: jokeJson[0].category, inline: true },
            { name: 'Rating', value: jokeJson[0].rating, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Joke # ' });
        // Send the embed to the trivia channel
        await channel.send({ embeds: [embed] }).then((message) => {
          resolve(message); 
        });
    });

     
}

  // get Trivia questions
  async getJokes(model, numberJokes, type, category, rating) {
    console.info('ChatGPTClient.getJokes() - model: ' + model + ' numberJokes: ' + numberJokes + ' category: ' + category + ' rating: ' + rating);  
    //const exampleReponse = "[{\"category\":\"General Knowledge\",\"difficulty\":\"Easy\",\"type\":\"multiple\",\"question\":\"What is the capital city of Australia?\",\"choices\":[\"Canberra\",\"Sydney\",\"Melbourne\",\"Brisbane\"],\"correct_answer\":\"Canberra\",\"source\":\"gpt-3.5-turbo\"},{\"category\":\"General Knowledge\",\"difficulty\":\"Medium\",\"type\":\"boolean\",\"question\":\"The Great Wall of China is visible from space.\",\"choices:\"[\"True\",\"False\"],\"correct_answer\":\"False\",\"source\":\"gpt-3.5-turbo\"}]"
 
    let jokeContextData = [];
    jokeContextData.push({
         role: 'system', 
         content: 'You are a commedian with a deep and wide body of jokes, it is your job to choose new and random jokes for your audience. Ensure that jokes are diverse both in terms of format and material.  ',
    });
    jokeContextData.push({
      role: 'user',
      content: 'Roll a 20 sided die and use that to generate ' + numberJokes + ' ' + type + ' jokes with a '+ rating + ' rating. For each joke, provide the setup, punchline, type, category, rating (either G, PG, PG-13 or Edgy), and source ('+ model +') in JSON format.  Please return the jokes as a single-line, minified JSON string. Example: ' + exampleJokeResponse,
    });
    const temperature = 1.1; // how creative the AI is with the response
    console.info('WTF is going on?')
    const jokeJson = await this.getMinifiedJsonFromAi(model, jokeContextData, temperature);
    console.info('ChatGPTClient.getJokes() - minifiedJSON: ');
    console.log(jokeJson);
    try {
      
     
      console.info('setup: ' + jokeJson[0].setup);
      console.info('punchline: ' + jokeJson[0].punchline);
      console.info('type: ' + jokeJson[0].type);
      console.info('category: ' + jokeJson[0].category);
      console.info('rating: ' + jokeJson[0].rating);
      console.info('source: ' + jokeJson[0].source);
      return jokeJson;
      
    } catch (error) {
      console.error("ERROR: " + error);
      jokeContextData.push({
        role: 'user',
        content: 'I got this error while validating the jokes on the last response: ' + error + ': can you try again?',
      });
    }
    
  }

  // get trivia questions
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
      content: 'Generate ' + numberQuestions + ' trivia questions related to ' + category + ' and a difficulty of ' + difficulty + ' For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers, correct_answer, and source (' + model + ' )"). Return the questions as a single-line, minified JSON string: ' + exampleTriviaResponse,
    });
    return await this.validateTriviaQuestions(model, triviaContextData);

  } async validateTriviaQuestions(model, triviaContextData) {
    const temperature = 0.6;
    let minifiedJSON = await this.getMinifiedJsonFromAi(model, triviaContextData, temperature);

    try {
      for (let i = 0; i < json.length; i++) {
        // check if correct_answer is in incorrect_answers
        if (minifiedJSON[i].incorrect_answers.includes(minifiedJSON[i].correct_answer)) {
          console.info('removing correct_answer from incorrect_answers ' + minifiedJSON[i].incorrect_answers.length);
          minifiedJSON[i].incorrect_answers.splice(minifiedJSON[i].incorrect_answers.indexOf(minifiedJSON[i].correct_answer), 1); // remove correct_answer from incorrect_answers
          console.info('incorrect_answers ' + minifiedJSON[i].incorrect_answers.length);
        }
        // if json[i].incorrect_answers is 4 items long, remove the last item
        if (minifiedJSON[i].incorrect_answers.length == 4) {
          console.info('removing last item from incorrect_answers ' + minifiedJSON[i].incorrect_answers.length);
          minifiedJSON[i].incorrect_answers.splice(3, 1); // remove last item from incorrect_answers
          console.info('incorrect_answers ' + minifiedJSON[i].incorrect_answers.length);
        }
        // ensure json includes type
        if (!minifiedJSON[i].type && minifiedJSON[i].incorrect_answers.length > 1) { // if type is not defined and incorrect_answers is more than 1 item
          console.info('adding type to json');
          minifiedJSON[i].type = 'multiple';
        } else if (!minifiedJSON[i].type && minifiedJSON[i].incorrect_answers.length == 1) { // if type is not defined and incorrect_answers is 1 item
          console.info('adding type to json');
          minifiedJSON[i].type = 'boolean';
        }
      }
      console.info('JSON is valid on first pass');
      return minifiedJSON;

    } catch (error) {
      console.error("ERROR: " + error);
      triviaContextData.push({
        role: 'user',
        content: 'I got this error while validating the questions on the last response: ' + error + ': can you try again?',
      });
    }
    //TODO Potential to cause infinite loop
    return await this.validateTriviaQuestions(model, triviaContextData);
    

  }

  async getMinifiedJsonFromAi(model, contextData, temperature) {
    console.info('ChatGPTClient.getMinifiedJsonFromAi()');
    let jsonString = null;
    let json = null;
    
    await this.openai.createChatCompletion({
      model: model,
      messages: contextData,
      temperature: temperature, // adjust this value to control the amount of randomness in the response

      })
      .then(async (result) => {
        
        try {
          console.info('Response Choices: ' + result.data.choices.length );
          for (let i = 0; i < result.data.choices.length; i++) {
            console.info('Response Text: ' + i + ' ' + result.data.choices[i].message.content.toString());
          }
          const responseText = result.data.choices[Math.floor(Math.random() * result.data.choices.length)].message.content.toString();
          console.log('Response Text: ' + responseText);
          
          jsonString = responseText.substring(responseText.indexOf('['), responseText.indexOf(']') + 1);         // remove everything before the first '[' and remove "'" from the string                   

          json = await JSON.parse(jsonString); 
          console.log(json);
          
          
          
    
        } catch (error) {
          console.error("ERROR: " + error);
          contextData.push({
            role: 'user',
            content: 'I got this error while using JSON.parse() in node.js on the last response: ' + error + ': can you try again?',
          });
          console.info("SOMETHINGS WRONG");
          return await this.getMinifiedJsonFromAi(model, contextData, temperature);   
        } 
      }); 
   
      return json;            
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