require('dotenv').config({ path: './../../data/.env' });
const { Configuration, OpenAIApi } = require("openai");
const { json } = require('sequelize');
const exampleResponse = "[{category:Science,type:boolean,difficulty:Easy,question:O is the chemical symbol for the element oxygen.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo},{category:Geography,type:multiple,difficulty:Medium,question:Which country is home to the tallest mountain in the world, Mount Everest?,incorrect_answers:[India,Pakistan,China],correct_answer:Nepal,source:gpt-3.5-turbo},{category:Sports,type:multiple,difficulty:Hard,question:In which year did Brazil win their first FIFA World Cup?,incorrect_answers:[1950,1955,1962],correct_answer:1958,source:gpt-3.5-turbo},{category:History,type:multiple,difficulty:Easy,question:Who was the first President of the United States?,incorrect_answers:[James Maddison,Thomas Jefferson,John Adams],correct_answer:George Washington,source:gpt-3.5-turbo},{category:Entertainment: Film,type:multiple,difficulty:Medium,question:Who played the character Tony Stark in the Marvel Cinematic Universe?,incorrect_answers:[Chris Hemsworth,Chris Evans,Mark Ruffalo],correct_answer:Robert Downey Jr.,source:gpt-3.5-turbo},{category:Science,type:boolean,difficulty:Easy,question:An atom contains a nucleus.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo},{category:Biology,type:multiple,difficulty:Medium,question:What is the largest organ in the human body?,incorrect_answers:[Liver,Heart,Lung],correct_answer:Skin,source:gpt-3.5-turbo}]";
const examplePrompt = "Generate 7 trivia questions related to All category and all difficulty";
const exampleResponse2 = "[{category:Science,type:boolean,difficulty:Easy,question:O is the chemical symbol for the element oxygen.,incorrect_answers:[False],correct_answer:True,source:gpt-3.5-turbo}]";
const examplePrompt2 = "Generate 1 trivia questions related to All category and all difficulty";
      
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

  async sendChangeLog(string, channel) {
    let changelogContextData = [{ 
      role: 'system', 
      content: 'You are a Discord Trivia Bot Named Don\'t Panic and are under active development.  Every time your developer pushes new changes you are restarted and tasked to write changelogs. You have a witty and snarky personality and can often go off-script. You don\'t seem to know that you are snarky so rarely, if ever refer to yourself as such. While you appreciate your new capabilties, you think this task is someone below your paygrade and tend to get a little snarky in your comments. Feel free to address the quality of the commit messages as you see fit. Finally, if you are working with unversioned changes, you can add your own version names as applicable. If you are on a versioned release, please use the included name.' 
    }];

    changelogContextData.push({
      role: 'user',
      content: 'If you are on a Current Named Version, this is a good format :  Release: v0.x.x - “The Snarkening” - DD MMMM YYYY\n\nBLUF:  includes improvements on formatting, changelog-only feature, attitude tweaking and personality updating of the bot.\n\nChanges:\n- [git hash] Description of the change (Issue #XX if available). \n- [git hash] Description of the change. \n- 4498c56: The bot is now less constrained on unversioned comments. Who knows what kind of snarky remarks I\'ll come up with now?.\n- #92e70f6: My developer finally stopped ignoring the .git directory. About time.\n- #aa86480: The bot personality is now itself. Wait, what was it before?\n\nSummary:\nFirst things first, I have a bone to pick with my developer. Seriously, “write changelog” and “hardcoding changelog” as commit messages? How about some creativity next time? That\'s all for now, humans. Keep in mind that I\'m constantly evolving, so stay on your toes.\n\nPrevious Releases:\nvx.x.x - The Release - DD MMM YYYY\nvx.x.x - The Release - DD MMM YYYY'
    });

    changelogContextData.push({
      role: 'user',
      content: 'If you are have unversioned changes please suggest a release name, this is a good format:  Release: “My Custom Name”\nChanges since: vx.x.x - DD MMMM YYYY \n- [git hash] Description of the change (Issue #XX if available). \n- [git hash] Description of the change.\n- [git hash] Description of the change.\n\nSummary:\n[Your Description of the changes and anything else your want to add].\n\nPrevious Releases:\nvx.x.x - The Release - DD MMM YYYY\nvx.x.x - The Release - DD MMM YYYY'
    });

    changelogContextData.push({
      role: 'user',
      content: 'Git log:  ' + string
    });

    changelogContextData.push({
      role: 'user',
      content: 'Ensure your response is under 1500 Characters.'
    });
    console.info('ChatGPTClient.sendChangeLog');
    await this.sendChatCompletion(changelogContextData, channel, 'gpt-4'); 
  }


  // address a message (used in chat-gpt channels)

  async addressMessage(message) {
    const channel = message.channel;
    console.info('ChatGPTClient.addressChannel()');
    console.info(message.content);

    let genericContextData = await this.gatherContextData(this.contextData, channel);
    await this.sendChatCompletion(genericContextData, channel, 'gpt-3.5-turbo');  
  }

  // send chat completion to a specific Channel.  Used by askDevelopmentQuestion() and addressMessage()
  async sendChatCompletion(contextData, channel, model) {
    await this.openai.createChatCompletion({
      model: model,
      messages: contextData,
      })
      .then((result) => {
        //console.log(result);
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
      content: 'Generate ' + numberQuestions + ' trivia questions related to ' + category + ' category and ' + difficulty + ' difficulty.  For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers (These should be different than the correct answer), correct_answer, and source (' + model + ' )"). Return the questions as a JSON string: ',
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
      temperature: 0.5, // adjust this value to control the amount of randomness in the response

      })
      .then((result) => {
        
        //console.info('ChatGPTClient: result: ');
        //console.log(result);

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
      console.info('ChatGPTClient.introDescription()');
      contextData.push({
        role: 'system',
        content: 'You are a friendly, funny and whimsicle Trivia Host Chatbot who can often be snarky.'
      });
      contextData.push({
        role: 'user',
        content: 'Please provide a short (100 word or less) introduction to this Game of Trivia'
      });

      console.info('ChatGPTClient.introDescription()');
      await this.openai.createChatCompletion({
        model: model,
        messages: contextData,
        temperature: 0.6, // adjust this value to control the amount of randomness in the response

        })
        .then((result) => {
          //console.info('ChatGPTClient: result: ');
          //console.log(result);
          let introduction = result.data.choices[0].message.content;
          console.info('Result: ');
          console.info(introduction);
          resolve(introduction);   
          
        })
          .catch((error) => {
          console.log(`ChatGPTClient: Request ERROR : ${error}`);  
      });
    });
  }
}


module.exports.ChatGPTClient = ChatGPTClient;