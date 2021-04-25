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
 
    constructor(exerciseName, exerciseDescription, exerciseImage, discordMessage) {
        
        console.info("exercise constructor")
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
