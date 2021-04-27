//const { Exercise } = require('./../classes/Exercise.js');
const Discord = require('discord.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Exercise = require('../models/Exercise')(sequelize, Sequelize.DataTypes);

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

      //create a new row which is defined as exercise
      const [exercise, created] = await Exercise.findOrCreate({
        where: { name: exerciseName },
        defaults: {
          name: exerciseName,
          description: exerciseDescription,
          image: exerciseImage
        }
      });
      if (created) {
        this.MESSAGE.channel.send(exercise + " was created!")
      } else {
        this.MESSAGE.channel.send(exercise + " already existed!")
      }      
    } else if (subCommand === "remove") {
        
      let exerciseName = args[3].toLowerCase()
      let exerciseDescription = args[4].toLowerCase()
      let exerciseImage = args[5].toLowerCase()

			this.MESSAGE.channel.send("Sorry, remove is not a current functio, but we're thinking about it...")
    } else if (subCommand === 'list') {
              // Send a message with all exercises 
              Exercise.listExercises(this.MESSAGE.channel)
    }
  
  },
};
