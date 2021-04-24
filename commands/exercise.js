const { Exercise } = require('./../classes/exercise.js');
const Discord = require('discord.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Exercises = require('../models/Exercises.js')(sequelize, Sequelize.DataTypes);
module.exports = {
  name: 'exercise',
  description: 'Adding and removing exercises',
  async execute(msg, args) {
    this.MESSAGE = msg
    let subCommand = args[2].toLowerCase()

    if (subCommand === "add") {
      
      let exerciseName = args[3].toLowerCase()
      let exerciseDescription = args[4].toLowerCase()
      let exerciseImage = args[5].toLowerCase()
      //how to find a user in the db
			let exerciseSearchCriteria = { where: {
				exercise_name: exerciseName
			}};
      	//Check if exercise exists
			Exercises.findOne(exerciseSearchCriteria).then(response => {
				if (response === null) {
					//first time user on this bot
					this.MESSAGE.channel.send("Adding, " + exerciseName + "yay!")
          Exercises.create({
            exercise_name: exerciseName,
            exercise_description: exerciseDescription,
            exercise_image: exerciseImage,
          });
				} else {
					console.info('Exercise already resides on the server')
          return response.id
				}
			});
      
    } else if (subCommand === "remove") {
        
      let exerciseName = args[3].toLowerCase()
      let exerciseDescription = args[4].toLowerCase()
      let exerciseImage = args[5].toLowerCase()
			this.MESSAGE.channel.send("Sorry, remove is not a current functio, but we're thinking about it...")
    } else if (subCommand === 'list') {
              // Send a message with all exercises 
              Exercises.findAll().then(exerciseDbObjectsList => {
                let exerciseListString
                if (exerciseDbObjectsList === null) {
                    //first time user on this bot
                    this.MESSAGE.channel.send('No Exercises exist - null')
                } else if (exerciseDbObjectsList.length === 0 ) {
                  this.MESSAGE.channel.send('No Exercises exist - 0')
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
                                        
                                        this.MESSAGE.channel.send(exerciseListMessage)	
                }
            });
     
      
    }
  
  },
};
