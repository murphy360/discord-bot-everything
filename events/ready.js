require('../colors.js');
require('../greetings.js');
require('dotenv').config({ path: './../data/.env' });
const { CronJob } = require('cron');
const { exec } = require('child_process');
const { QuestionManager } = require('./../classes/trivia/questionManager.js');
const { ChatGPTClient } = require('./../classes/chatGPT/ChatGPTClient.js');
const fs = require('fs');
const { SystemCommands } = require('./../classes/Helpers/systemCommands.js');

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

const { Events } = require ('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        try {
            require('./../deployCommands.js'); // Deploy slash commands
        } catch (error) {
            console.error(error);
        }

        client.guilds.cache.forEach(async (guild) => {
            triviaExists = false;
            chatGPTExists = false;
            parentTextChannelId="";
            generalChannelId="";

            console.info(`Checking setups for + ${guild.name}`);
            

            guild.commands.set([]); // Clear the commands cache for this guild

            const defaultChannel = guild.systemChannel;
            parentTextChannelId = defaultChannel.parentId;

            let helper = new SystemCommands();
            let contextData = await helper.checkPermissions(guild);

            
            if (contextData.length == 0) {
                helper.checkChannel(guild);
                helper.checkRole(guild);
                
            } else {
                helper.exitGuild(guild, contextData, true);
            }

            console.log("EVENTS FOR DEV GUILD");
    
            guild.scheduledEvents.fetch()
            // then log each event creator
            //.then(events => events.forEach(event => console.log(event)))
            .catch(console.error);

            

            if (guild.id == DEV_GUILD_ID){
                let chatGPTClient = new ChatGPTClient();
                const devChannel = await guild.channels.cache.find(channel => channel.name === "trivia_bot");

                fs.readFile('changelog.txt', 'utf8', (err, data) => {
                    if (err) {
                      console.error(err);
                      chatGPTClient.sendChangeLog(data, devChannel);
                      return;
                    }
                    console.log(data);
                    
                    chatGPTClient.sendChangeLog(data, devChannel);
                  });

                scheduleNightlyTriviaGame(guild);
                // Create a cron job to run every morning at 0600 to schedule tonight's game
                const job = new CronJob('0 0 6 * * *', () => scheduleNightlyTriviaGame(guild), null, true, 'Pacific/Auckland');
                job.start();     
                
                //addQuestions();
                // Create a cron job to run every 6 hours to add new questions to the database
                const job2 = new CronJob('0 0 0,6,16 * * *', () => addQuestions(), null, true, 'UTC');
                job2.start();

            }
            
           
        });       

        // Add New Questions to Database
        async function addQuestions() {
            const manager = new QuestionManager(client);
            // Get a random category
            let category = await manager.getRandomCategoryFromDataBase();
            let questions = await manager.addQuestions(10, category, 'all', null, 'gpt-4');
            console.info('ready.js: Added ' + questions.length + ' questions to the database');
            manager.reportNewQuestionsToDeveloperChannel(questions, category, 'all');          
        }


        // Schedule a Trivia Night Event at 8pm tonight if it doesn't exist
        function scheduleNightlyTriviaGame(guild) {
            // Code to execute on the schedule
            console.log('Scheduled task executed!');
            // Create Trivia Night Event next thursday at 8pm if it doesn't exist
            guild.scheduledEvents.fetch()
            .then(async events => {
                
                // get current date
                const tonight = new Date(); 

                // set tonight to tonight at 8pm
                tonight.setHours(20, 0, 0, 0);

                // scheduled start time ISO8601 timestamp
                const scheduledStartTime = tonight;
                const scheduledEndTime = new Date(tonight.getTime() + 3600000);
                const tonightsEvent = events.find(event => event.name === 'Trivia Night');
                
                if (!tonightsEvent) {
                    guild.scheduledEvents.create({
                        name: 'Trivia Night',
                        description: 'Trivia Night',
                        scheduledStartTime: scheduledStartTime,
                        scheduledEndTime: scheduledEndTime,
                        privacyLevel: 2,
                        entityType: 3,
                        entityMetadata: {
                            location: '#trivia'
                        }
                    })                        
                    .then(event => console.info(event.creator.username + ': Created ' + event.name + ' in ' + guild.name + ' at ' + event.scheduledStartTimestamp))
                    .catch(console.error);
                } else {
                    console.info(guild.name + ': Trivia Night Event Exists');
                }
            }
            ).catch(console.error);
          } 
    },
};