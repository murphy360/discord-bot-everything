require('dotenv').config({ path: './../../data/.env' });
const { Configuration, OpenAIApi } = require("openai");
const { json } = require('sequelize');
const exampleResponse = "[{category:Science,type:boolean,difficulty:Easy,question:O is the chemical symbol for the element oxygen.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo},{category:Geography,type:multiple,difficulty:Medium,question:Which country is home to the tallest mountain in the world, Mount Everest?,incorrect_answers:[India,Pakistan,China],correct_answer:Nepal,source:gpt-3.5-turbo},{category:Sports,type:multiple,difficulty:Hard,question:In which year did Brazil win their first FIFA World Cup?,incorrect_answers:[1950,1955,1962],correct_answer:1958,source:gpt-3.5-turbo},{category:History,type:multiple,difficulty:Easy,question:Who was the first President of the United States?,incorrect_answers:[James Maddison,Thomas Jefferson,John Adams],correct_answer:George Washington,source:gpt-3.5-turbo},{category:Entertainment: Film,type:multiple,difficulty:Medium,question:Who played the character Tony Stark in the Marvel Cinematic Universe?,incorrect_answers:[Chris Hemsworth,Chris Evans,Mark Ruffalo],correct_answer:Robert Downey Jr.,source:gpt-3.5-turbo},{category:Science,type:boolean,difficulty:Easy,question:An atom contains a nucleus.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo},{category:Biology,type:multiple,difficulty:Medium,question:What is the largest organ in the human body?,incorrect_answers:[Liver,Heart,Lung],correct_answer:Skin,source:gpt-3.5-turbo}]";
const examplePrompt = "Generate 7 trivia questions related to All category and all difficulty";
const exampleResponse2 = "[{category:Science,type:boolean,difficulty:Easy,question:O is the chemical symbol for the element oxygen.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo}]";
const examplePrompt2 = "Generate 1 trivia questions related to All category and all difficulty";
const exampleValidationPrompt = "Please check this question for accuracy: Question: O is the chemical symbol for the element oxygen. Answer: True, Category: None, Difficulty: Easy Incorrect Answers: False Source: 515153941558984705";
const exampleValidationResponse = "[{valid:true,category:Science,type:boolean,difficulty:Easy,question:O is the chemical symbol for the element oxygen.,incorrect_answers:[False],correct_answer:True,source:515153941558984705}]";
const exampleValidationPrompt2 = "Please check this question for accuracy: Question: What is the capital of the United States? Answer: San Diego CA., Category: Geography, Difficulty: Easy Incorrect Answers: None, Source: 515153941558984705";
const exampleValidationResponse2 = "[{valid:false,category:Geography,type:multiple,difficulty:Easy,question:What is the capital of the United States?,incorrect_answers:[San Diego CA.,New York City,Annapolis MD.],correct_answer:Washington DC,source:515153941558984705}]";
const exampleValidationPrompt3 = "Please check this question for accuracy and return a corrected question and answer if it's inacurate: Question: Who created Mickey Mouse? Answer: Corey Murphy, Category: None, Difficulty: None Incorrect Answers: None, Source: 515153941558984705.";
const exampleValidationResponse3 = "[{ \"valid\": false, \"category\": \"Entertainment: Cartoon & Animations\", \"type\": \"multiple\", \"difficulty\": \"Easy\", \"question\": \"Who created Mickey Mouse?\", \"incorrect_answers\": [\"Ollie Johnston\",\"John Lasseter\",\"Norm Ferguson\",\"Stan Lee\"], \"correct_answer\": \"Walt Disney\", \"source\": \"515153941558984705\" }]"

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
    await this.sendChatCompletion(genericContextData, channel, 'gpt-3.5-turbo');  
  }

  // get a random trivia categories
  async getRandomTriviaCategories(numberCategories, model) {
    return new Promise(async (resolve, reject) => {
      let categoryContextData = [{ role: 'system', content: 'You are a Discord Bot Tasked to act as a trivia host.  You are creating a new Trivia Event and need to choose the categories that will be used in the next event.  It is important to be creative, eclectic and surprising in your selections.' }];
      categoryContextData.push({
        role: 'user',
        content: 'Please Generate ' + numberCategories + ' random trivia categories. Return only the categories, separated by commas. For example: History, Pokemen, Gray\'s Anatomy' 
      });
      await this.openai.createChatCompletion({
        model: model,
        messages: categoryContextData,
        temperature: 0.7, // adjust this value to control the amount of randomness in the response
        })
        .then((result) => {
          let categories = result.data.choices[0].message.content;
          console.info('ChatGPTClient: Category: ');
          console.info(categories);
          resolve(categories);
        })
          .catch((error) => {
          console.log(`ChatGPTClient: Request ERROR : ${error}`);
      });
    });
  }

  // send chat completion to a specific Channel.  Used by askDevelopmentQuestion() and addressMessage()
  async sendChatCompletion(contextData, channel, model) {
    await this.openai.createChatCompletion({
      model: model,
      messages: contextData,
      })
      .then(async (result) => {
        //console.log(result);
        try {
          const responseText = result.data.choices[0].message.content.toString();
          console.log('ChatGPTClient: Response in ' + channel.name + ': ' + responseText);
          await channel.send(responseText);
        } catch (error) {
          console.error("ChatGPTClient: Send Error in " + channel.name);
          console.error(error);
        }
        })
        .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
    });
  }

  async getChatCompletion(contextData, model) {
    return new Promise(async (resolve, reject) => {
      await this.openai.createChatCompletion({
        model: model,
        messages: contextData,
        })
        .then(async (result) => {
          //console.log(result);
          try {
            const responseText = result.data.choices[0].message.content.toString();
            resolve(responseText);
          } catch (error) {
            console.error("ChatGPTClient: Send Error");
            console.error(error);
          }
          })
          .catch((error) => {
          console.log(`OPENAI ERR: ${error}`);
      });
    });
  }

  // Validate a user's new question
  async validateQuestion(question, answer, category, difficulty, incorrect_answers, source, model) {
    
      let questionContextData = [{ role: 'system', content: 'You are a Discord Bot Tasked to act as a trivia host.  You are validating a new trivia question.  It is important to ensure the question is valid and that the answer is correct.' }];

         
      questionContextData.push({
      role: 'user',
      content: 'Example Prompt: ' + exampleValidationPrompt + ' Example Response: ' + exampleValidationResponse,
      });   

      questionContextData.push({
        role: 'user',
        content: 'Example Prompt: ' + exampleValidationPrompt3 + ' Example Response: ' + exampleValidationResponse3,
      });
      questionContextData.push({
        role: 'user',
        content: 'Please check this question for accuracy: Question: ' + question + ' Answer: ' + answer + ' Category: ' + category + ' Difficulty: ' + difficulty + ' Incorrect Answers: ' + incorrect_answers + ' Source: ' + source + 'For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: valid, category, difficulty, question, incorrect_answers. (Provide four unique incorrect answers for multiple choice questions. Each incorrect answer should be different than the correct answer), correct_answer, and source. Do your best to classify your responses into common trivia categories.  Return the questions as a JSON string:'
      });
      console.info('ChatGPTClient.validateQuestion()');
      return await this.getJsonFromAi(model, questionContextData);
  }
  
  async getTriviaQuestions(numberQuestions, category, difficulty, oldQuestionContextData, model) {
    
    let triviaContextData = [];

    triviaContextData.push({
         role: 'system', 
         content: 'You are a trivia Host, it is your job to curate new and interesting trivia questions.  It is critical to avoid returning questions that have already been asked. Ensure you are adding a significant amount of randomness when selecting new questions.',
    });
    if (oldQuestionContextData.length > 0) {
      triviaContextData.push(oldQuestionContextData[0]);
    }    
    triviaContextData.push({
      role: 'user',
      content: 'Example Prompt: ' + examplePrompt + ' Example Response: ' + exampleResponse,
    });   
    triviaContextData.push({
      role: 'user',
      content: 'Example Prompt: ' + examplePrompt2 + ' Example Response: ' + exampleResponse2,
    });
    triviaContextData.push({
      role: 'user',
      content: 'Generate ' + numberQuestions + ' trivia questions related to ' + category + '  with ' + difficulty + ' difficulty.  For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers. (Three for multiple choice. These should be different than the correct answer), correct_answer, and source (' + model + ' )"). Do your best to classify your responses into common trivia categories.  Return the questions as a JSON string: ',
    });
 
    return await this.getJsonFromAi(model, triviaContextData);

    
  }

  async getJsonFromAi(model, triviaContextData) {
    let jsonString = null;
    let json = null;
    let modelString = null;
    await this.openai.createChatCompletion({
      model: model,
      messages: triviaContextData,
      temperature: 0.7, // adjust this value to control the amount of randomness in the response

      })
      .then((result) => {

        //log number of choices
        modelString = result.data.model;
        jsonString = result.data.choices[0].message.content;
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');
        jsonString = jsonString.substring(startIndex, endIndex + 1); 
        jsonString = jsonString.replace(/\\/g, '');      
      })
        .catch((error) => {
        console.log(`ChatGPTClient: Request ERROR : ${error}`);
        if (error = 'Request failed with status code 503') {
          console.info('ChatGPTClient: Request failed with status code 503 - likely due to rate limiting');         
          //TODO REPORT TO DEVELOPER CHANNEL
          //return 'FAILED';
        } else if (error = 'Request failed with status code 400') {
          //TODO REPORT TO DEVELOPER CHANNEL
          console.info('ChatGPTClient: Request failed with status code 400 - likely due to OpenAI Request');
          
          //return 'FAILED';
        } else {
          //TODO REPORT TO DEVELOPER CHANNEL
          console.info('ChatGPTClient: Request failed with status code ' + error);
          //return 'FAILED';
          
        }
        //

        
    });
    try {

      json = JSON.parse(jsonString);  
      json = this.cleanTriviaJSON(json, modelString);
      return json;

    } catch (error) {
      console.error("ChatGPTClient: Parse or Clean Error: " + error);
      console.log('JSON String: ');
      console.log(jsonString);

      if (jsonString != null) {
        // Count number of brackets [ and ] in the string
        let openBrackets = jsonString.split('[');
        let closeBrackets = jsonString.split(']');
        let totalBrackets = openBrackets.length + closeBrackets.length - 2;
        if (totalBrackets < 4) {
          triviaContextData.push({
            role: 'user',
            content: 'I got this error on the last response: ' + error + ': Please try adding [ and ] to the beginning and end of the JSON response and try again.',
          });
        } else {
          triviaContextData.push({
            role: 'user',
            content: 'I got this error while using JSON.parse() on the last response: ' + error + ': can you try again?',
          });
        }
      } else {
        console.log('JSON String is null');
        triviaContextData.push({
          role: 'user',
          content: 'I got this error while using JSON.parse() on the last response: ' + error + ': can you try again?',
        });
      }     
      return await this.getJsonFromAi('gpt-4', triviaContextData);
    }
  }

  // strip all text not in json format from a string
  cleanTriviaJSON(json, modelString) {
    console.info('ChatGPTClient.cleanTriviaJSON()');
    for (let i = 0; i < json.length; i++) {
      // check if correct_answer is in incorrect_answers and remove it
      if (json[i].incorrect_answers.includes(json[i].correct_answer)) {
        json[i].incorrect_answers.splice(json[i].incorrect_answers.indexOf(json[i].correct_answer), 1); // remove correct_answer from incorrect_answers
       } 


      if (json[i].incorrect_answers.length == 4) {
        json[i].incorrect_answers.splice(3, 1); // remove last item from incorrect_answers
      } 

      // ensure json includes type
      if (!json[i].type && json[i].incorrect_answers.length > 1) { // if type is not defined and incorrect_answers is more than 1 item
        json[i].type = 'multiple';
      } else if (!json[i].type && json[i].incorrect_answers.length == 1) { // if type is not defined and incorrect_answers is 1 item
        json[i].type = 'boolean';
      }

      // if incorrect_answers is less than 3 and type is multiple, add more incorrect_answers
      if (json[i].incorrect_answers.length < 3 && json[i].type == 'multiple') {
        // TODO - get openai to add more incorrect answers
        json[i].incorrect_answers.push('Incorrect Answer 1');
      }

      // if modelString is not null add it to the json
      if (modelString != null) {
        json[i].source = modelString;
      }
    }
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

  // Intro Description
  async introDescription(contextData, model) {
    return new Promise(async (resolve, reject) => {
      contextData.push({
        role: 'system',
        content: 'You are a friendly, funny and whimsicle Trivia Host Chatbot who can often be snarky.'
      });
      contextData.push({
        role: 'user',
        content: 'Please provide a short (100 word or less) introduction to this Game of Trivia'
      });

      await this.openai.createChatCompletion({
        model: model,
        messages: contextData,
        temperature: 0.6, // adjust this value to control the amount of randomness in the response

        })
        .then((result) => {
          let introduction = result.data.choices[0].message.content;
          resolve(introduction);   
        })
          .catch((error) => {
          console.log(`ChatGPTClient: Request ERROR : ${error}`);  
      });
    });
  }
}


module.exports.ChatGPTClient = ChatGPTClient;