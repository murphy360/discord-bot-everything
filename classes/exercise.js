const Discord = require('discord.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
const Exercises = require('../models/Exercises')(sequelize, Sequelize.DataTypes);
class Exercise {
 
    constructor(exerciseId, exerciseName, exerciseDescription, exerciseImage, discordMessage) {
        
        console.info("exercise constructor")
        this.id=exerciseId
        this.name=exerciseName                          // Name of Exercise
        this.description=exerciseDescription            // Short Description of Exercise
        this.image=exerciseImage                        //optional 
        this.MESSAGE=discordMessage                    // original message from user
        this.REPS
    }


// Save executed exercise to database
    logExercise(reps, time, user) {
        
        return bar;
    }

    // Save executed exercise to database
    listExercise(message) {

        // Send a message with all exercises 
        Exercises.findAndCountAll().then(exerciseDbObjectsList => {
            let exerciseListString
            if (exerciseDbObjectsList === null) {
                //first time user on this bot
                message.channel.send('No Exercises exist - null')
            } else if (exerciseDbObjectsList.count === 0 ) {
                message.channel.send('No Exercises exist - 0')
            }else {
                console.info(exerciseDbObjectsList.count + ' Exercises already reside on the server')
                for (let i = 0; i < exerciseDbObjectsList.length ; i++) {
                    exerciseListString += exerciseDbObjectsList[i].exercise_name + ": " + exerciseDbObjectsList[i].exercise_description + "\n"
                }
        
                const exerciseListMessage = new Discord.MessageEmbed()
                                    .setTitle("Available Exercises")
                                    .setColor(this.color)
                                    .setDescription("Below are a list of available exercises, message an admin to have new Exercises Added")
                                    //.setThumbnail(this.icon)
                                    
                 message.channel.send(exerciseListMessage)	
            }
        });
    }


// Starts a new set of an exercise
    newExerciseSet(){
        
    }

    async getExercise(exerciseName) {
        //Create an entry in the database for this set (you get one entry per user+round+exercise)
        Exercise.findOne(serverSearchCriteria).then(knownServer => {
			if (knownServer === null) {
				console.info('First time with this server');
				try{
					console.info('Logging server: ' + message.guild.name);
					Servers.create({
						server_id: message.guild.id,
						server_name: message.guild.name,
					}).then(newServer => {
						message.channel.send('Hey thanks for the invite! This is my first time on ' + newServer.server_name);
					});
				}catch(e) {
					if (e.name === 'SequelizeUniqueConstraintError') {
						return console.info('That server already exists.');    
					}
					return message.channel.send('Something went wrong with logging the server');       
				}
			} else {
				console.info('This server exists in the db');
			}
		});
    }

    setReps(repetitions){
        this.REPS=repetitions
    }

// Start Publishing exercise on periodic basis
    startExercise(reps, periodicity, sets, message) {
                                         

    // Update the progress message, to be used int he setInterval call
        let update = function (progress_bar) {
            this.TIME_LEFT -= this.DEC_INT;
            
        // If there is no time left, show the finish text and clear the interval, otherwise update the progress bar
            if (this.TIME_LEFT <=0) {
                progress_bar.edit("```"+this.FINISH_TEXT[Math.floor(Math.random()*this.FINISH_TEXT.length)]+"```");
                clearInterval(int)
                return 0;
           } else {
                progress_bar.edit(this.makeBar(this.TIME_LEFT))
           }
        }
        
    // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send(this.makeBar(this.TIME_LEFT)).then( embed => { 
            int = setInterval(update.bind(this), interval, embed);
        });
    }

    stopExercise() {

    }

}

module.exports.Exercise = Exercise;
