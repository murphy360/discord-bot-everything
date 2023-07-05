require('dotenv').config({ path: './../../data/.env' });
const { Configuration, OpenAIApi } = require("openai");
const { json } = require('sequelize');
const exampleResponse = "[{category:Science,difficulty:Easy,question:What is the chemical symbol for the element oxygen?,incorrect_answers:[Ox,Oxg,On],correct_answer:O,source:gpt-3.5-turbo},{category:Geography,difficulty:Medium,question:Which country is home to the tallest mountain in the world, Mount Everest?,incorrect_answers:[India,Pakistan,China],correct_answer:Nepal,source:gpt-3.5-turbo},{category:Sports,difficulty:Hard,question:In which year did Brazil win their first FIFA World Cup?,incorrect_answers:[1950,1955,1962],correct_answer:1958,source:gpt-3.5-turbo},{category:History,difficulty:Easy,question:Who was the first President of the United States?,incorrect_answers:[James Maddison,Thomas Jefferson,John Adams],correct_answer:George Washington,source:gpt-3.5-turbo},{category:Entertainment: Film,difficulty:Medium,question:Who played the character Tony Stark in the Marvel Cinematic Universe?,incorrect_answers:[Chris Hemsworth,Chris Evans,Mark Ruffalo],correct_answer:Robert Downey Jr.,source:gpt-3.5-turbo},{category:Science,difficulty:Hard,question:What is the chemical formula for table salt?,incorrect_answers:[NaCl2,Na2Cl,NaCl3],correct_answer:NaCl,source:gpt-3.5-turbo},{category:Biology,difficulty:Medium,question:What is the largest organ in the human body?,incorrect_answers:[Liver,Heart,Lung],correct_answer:Skin,source:gpt-3.5-turbo}]";
const examplePrompt = "Generate 7 trivia questions related to All category and all difficulty. For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers, correct_answer, and source (gpt-3.5-turbo )). Return the questions as a single-line, minified JSON string: ";
   
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
    let changelogContextData = [{ role: 'system', content: 'You are a Discord Trivia Bot Named Don\'t Panic and are under active development.  Every time your developer pushes new changes you are restarted and tasked to write changelogs. You have a witty and snarky personality and can often go off-script. You don\'t seem to know that you are snarky so rarely, if ever refer to yourself as such. While you appreciate your new capabilties, you think this task is someone below your paygrade and tend to get a little snarky in your comments. Feel free to address the quality of the commit messages as you see fit. Finally, if you are working with unversioned changes, you can add your own version names as applicable. If you are on a versioned release, please use the included name.' }];

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

  async getTriviaQuestions(numberQuestions, category, difficulty, oldQuestionContextData) {
    const model = 'gpt-3.5-turbo';
    let triviaContextData = [];


    triviaContextData.push({
         role: 'system', 
         content: 'You are a trivia Host, it is your job to curate new and interesting trivia questions.  It is critical to avoid returning questions that have already been asked. Ensure you are adding a significant amount of randomness when selecting new questions.',
    });
    triviaContextData.push({
      role: 'user',
      content: 'Example Prompt: ' + examplePrompt + ' Example Response: ' + exampleResponse,
    });
    triviaContextData.push({
      role: 'user',
      content: 'Generate ' + numberQuestions + ' trivia questions related to ' + category + ' category and ' + difficulty + ' difficulty.  For each question (if not defined, difficulty should be Easy, Medium or Hard), include the following information in JSON format: category, difficulty, question, incorrect_answers (These should be different than the correct answer), correct_answer, and source (' + model + ' )"). Return the questions as a single-line, minified JSON string: ',
    });
    if (oldQuestionContextData.length > 0) {
      triviaContextData.push(oldQuestionContextData[0]);
    }
    return await this.getMinifiedJsonFromAi(model, triviaContextData);

    
  }

  async getMinifiedJsonFromAi(model, triviaContextData) {
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
          jsonString = responseText;
          
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
      //console.info('JSON String ' + jsonString);
      json = JSON.parse(jsonString); 
     
      // remove "'" from the string
      jsonString = jsonString.replace(/\\/g, "");
      //console.info('JSON Clean String ' + jsonString);

      json = JSON.parse(jsonString); 


      for (let i = 0; i < json.length; i++) {
        // check if correct_answer is in incorrect_answers and remove it
        if (json[i].incorrect_answers.includes(json[i].correct_answer)) {
          json[i].incorrect_answers.splice(json[i].incorrect_answers.indexOf(json[i].correct_answer), 1); // remove correct_answer from incorrect_answers
         } 

        //console.info('ChatGPTClient: incorrect_answers.length: ' + json[i].incorrect_answers.filter(answer => answer !== correctAnswer));
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
      }

      return json;

    } catch (error) {
      console.error("ChatGPTClient: ERROR: " + error);
      
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