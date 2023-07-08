
const { Question } = require('./question.js');
const { Questions, Users, Games, Guilds } = require('../../dbObjects.js');
const { ChatGPTClient } = require('../chatGPT/ChatGPTClient.js');
const { ActivityType, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config({ path: './../data/.env' });
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

const triviaCategories = [
    { name: 'General Knowledge', value: '9' },
    { name: 'Entertainment: Books', value: '10' },
    { name: 'Entertainment: Film', value: '11' },
    { name: 'Entertainment: Music', value: '12' },
    { name: 'Entertainment: Musicals & Theatres', value: '13' },
    { name: 'Entertainment: Television', value: '14' },
    { name: 'Entertainment: Video Games', value: '15' },
    { name: 'Entertainment: Board Games', value: '16' },
    { name: 'Entertainment: Japanese Anime & Manga', value: '31' },
    { name: 'Entertainment: Cartoon & Animations', value: '32' },
    { name: 'Entertainment: Comics', value: '29' },
    { name: 'Science & Nature', value: '17' },
    { name: 'Science: Computers', value: '18' },
    { name: 'Science: Mathematics', value: '19' },
    { name: 'Science: Gadgets', value: '30' },
    { name: 'Mythology', value: '20' },
    { name: 'Sports', value: '21' },
    { name: 'Geography', value: '22' },
    { name: 'History', value: '23' },
    { name: 'Politics', value: '24' },
    { name: 'Art', value: '25' },
    { name: 'Celebrities', value: '26' },
    { name: 'Animals', value: '27' },
    { name: 'Vehicles', value: '28' }
];
 

class QuestionManager {
    
    constructor(client) {
        this.client = client;
        this.chatGPTClient = new ChatGPTClient();
        this.devGuild = this.client.guilds.cache.get(DEV_GUILD_ID);
		this.devChannel = this.devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
    }

    async getNumberOfQuestionsInDatabase() {
        return await Questions.count();
    }

    async getNumberOfCategoriesInDatabase() {
        return await Questions.count({
            attributes: ['category'],
            group: ['category'],
        });
    }

    async getNumberOfQuestionsAsked() {
        return await Questions.sum('times_asked');
    }

    async getNumberOfQuestionsAskedInCategory(category) {
        return await Questions.sum('times_asked', {
            where: {
                category: category,
            },
        });
    }

    async getNumberOfPlayersInDatabase() {
        return await Users.count();
    }

    async getNumberOfGamesPlayed() {
        return await Games.count();
    }

    async getNumberOfGuilds() {
        return await Guilds.count();
    }


    async reportNewQuestionsToDeveloperChannel(questions, category, difficulty) {

        const categories = await Questions.findAll({
            attributes: ['category'],
            group: ['category'],
        });

        // Count number of unique categories in database
        const numCategories = categories.length;

        // Count number of new questions added to database
        const numQuestions = questions.length;
        
        const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        if (questions.length > 0){
            //this.devChannel.send(LOG_DATE + ': Added ' + questions.length + ' new questions to database for category: ' + category + ' difficulty: ' + difficulty);
        } else {
            this.devChannel.send(LOG_DATE + ': Failed to add new questions category: ' + category + ' difficulty: ' + difficulty);
        }
        const numPlayers = await this.getNumberOfPlayersInDatabase();
        const numGames = await this.getNumberOfGamesPlayed();
        const numGuilds = await this.getNumberOfGuilds();
        const totalQuestions = await this.getNumberOfQuestionsInDatabase();

        const status = 'Trivia with ' + numPlayers + ' players in ' + numGames + ' games' + ' with ' + numQuestions + ' questions in ' + numCategories + ' categories';
        this.client.user.setActivity(status, { type: ActivityType.Watching });
        //this.devChannel.send(LOG_DATE + ' ' + numPlayers + ' players in ' + numGames + ' games' + ' with ' + numQuestions + ' questions in ' + numCategories + ' categories');
        
        const description = 'Added ' + numQuestions + ' question to the Database';

        // Create embed for logging
        let embed = new EmbedBuilder()
        // Set the title of the field
        .setTitle('DataBase Updated')
        .setDescription(description)
        // Set the color of the embed
        .setColor(0x0066ff)// Blue
        .addFields(
            { name: 'New Questions', value: numQuestions.toString(), inline: true },
            { name: 'Category', value: category, inline: true  },
            { name: 'Difficulty', value: difficulty, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Guilds', value: numGuilds.toString(), inline: true },
            { name: 'Players', value: numPlayers.toString(), inline: true  },
            { name: 'Categories', value: numCategories.toString(), inline: true },
            { name: 'Games Played', value: numGames.toString(), inline: true },
            { name: 'Total Questions', value: totalQuestions.toString(), inline: true },
        )
        // Set the main content of the embed
        .setThumbnail(this.client.user.displayAvatarURL())
        .setTimestamp()
    
        this.devChannel.send({ embeds: [embed] });   
        
    }

    async getRandomCategoryFromDataBase() {
        const categories = await Questions.findAll({
            attributes: ['category'],
            group: ['category'],
        });
        const randomCategory = Math.floor(Math.random() * categories.length);
        return categories[randomCategory].category;
    }

     // Get questions from internal database.  
     // Should select based on category and difficulty and return least-asked questions
     // If not enough questions are found, get questions from Open Trivia Database or OpenAI
     async getDBQuestions(numQuestions, category, difficulty) {
        const whereClause = {};
        if (category !== 'All') {
            whereClause.category = category;
        }
        if (difficulty !== 'all') {
            whereClause.difficulty = difficulty;
        }
        const dbQuestions = await Questions.findAll({
            where: whereClause,
            order: [['times_asked', 'ASC']],
            limit: numQuestions,
        });
        let questions = new Array()
        console.info('questionManager: Questions found in database: ' + dbQuestions.length + ' questions' + ' numQuestions: ' + numQuestions);
        if (dbQuestions.length == numQuestions) {
            console.info('questionManager: Found enough questions in database');
            for (let i = 0; i < numQuestions; i++) {
                questions[i] = new Question(this.client, dbQuestions[i], (i + 1), 'internal', dbQuestions[i].url );
            }
        } else {
            console.info('Not enough questions found in database, getting new questions');
            questions = await this.addQuestions(numQuestions, category, difficulty, null);
            this.reportNewQuestionsToDeveloperChannel(questions, category, difficulty);
        }
        return questions;
    }


    async getTDBQuestions(numQuestions, category, difficulty) {
       let url = 'https://opentdb.com/api.php?amount=' + numQuestions;
        
        if (difficulty !== 'all') {
            url = url + '&difficulty=' + difficulty;
        }

        if (category !== 'All') {
            const categoryObject = triviaCategories.find((element) => element.name === category);
            const categoryValue = categoryObject.value;
            url = url + '&category=' + categoryValue;
        }
 
        const file = await fetch(url).then(response => response.text());
        const json = JSON.parse(file);
        let questions = new Array()
        for (let i = 0; i < numQuestions; i++) {
            questions.push(new Question(this.client, json.results[i], (i + 1), 'The Open Trivia Database', 'https://opentdb.com' ));
        }
        console.info('QuestionManager: getTDBQuestions(): got ' + questions.length + ' questions from The Open Trivia Database');
        return questions;
    }

    // get questions least asked
    async getOpenAIQuestions(numQuestions, category, difficulty, oldQuestionContextData, model) {
        return new Promise((resolve, reject) => {
            this.chatGPTClient.getTriviaQuestions(numQuestions, category, difficulty, oldQuestionContextData, model).then((json) => {
                let questions = new Array()
                
                //console.log(json);
                for (let i = 0; i < json.length; i++) {
                    //console.log(json[i].source + ' ' + json[i].question);
                    questions.push(new Question(this.client, json[i], (i + 1), json[i].source, 'https://openai.com/' ));
                }
                console.info('QuestionManager: getOpenAIQuestions(): got ' + questions.length + ' questions from OpenAI');
                resolve(questions);
            });
        });
    }

    
    // Add questions to internal database, try to get questions from Open Trivia Database first if category is supported
    // If category is not supported, get questions from OpenAI. This is a recursive function that will call itself until
    // it has enough new questions to return.
    // Returns an array of new questions that were added to the database
    async addQuestions(numQuestions, category, difficulty, oldQuestionContextData, model) {
         // add questions to database
         let questions = null;
         let newQuestionsArray = new Array();
         let oldQuestions = 0;
         let newQuestions = 0;
         if (model == null) {
            model = 'gpt-3.5-turbo';
        } 
        if (!oldQuestionContextData) {
        oldQuestionContextData = [];    
        }

        // if oldQuestionContextData is not empty, get questions from OpenAI (this is a recursive call)
        if (oldQuestionContextData.length > 0) {
            console.info('questionManager: addQuestions(): Old Question Context Data Found, getting new questions from OpenAI with model: ' + model);
            questions = await this.getOpenAIQuestions(numQuestions, category, difficulty, oldQuestionContextData, model);
        // if category is supported by Open Trivia Database, get questions from there
        } else if (oldQuestionContextData.length == 0 && triviaCategories.find(element => element.name === category)) {
            console.info('Category ' + category + ' is supported by Open Trivia Database. Getting questions from there');
            questions = await this.getTDBQuestions(numQuestions, category, difficulty);
        // if category is not supported by Open Trivia Database, get questions from OpenAI
        } else {
            console.info('Category ' + category + ' is not supported by Open Trivia Database. Getting questions from OpenAI with model: ' + model);
            questions = await this.getOpenAIQuestions(numQuestions, category, difficulty, oldQuestionContextData, model);
        }

        if (questions == 'FAILED') {
            console.info('QuestionManager: addQuestions(): Failed to get questions from OpenAI');
            return newQuestionsArray;
        }

         for (let i = 0; i < questions.length; i++) {
            if (await questions[i].storeQuestion()) {
                oldQuestionContextData.push({
                    role: 'user',
                    content: questions[i].question + ' already exists do not return any variation of it again',
                  });
                oldQuestions++;
            } else {
                newQuestionsArray.push(questions[i]);
                newQuestions++;
            }
        }
        // Recursively call addQuestions until we have enough new questions
        if (oldQuestions > 0) {
            console.info('questionManager: Found ' + oldQuestions + ' existing questions in the database, getting ' + oldQuestions + ' more new questions');
            // add questions to newQuestionsArray
            newQuestionsArray = newQuestionsArray.concat(await this.addQuestions(oldQuestions, category, difficulty, oldQuestionContextData, model));
        } 
        console.info('Adding ' + newQuestions + ' new questions to database ');
        return newQuestionsArray;
    }
}

module.exports.QuestionManager = QuestionManager;
