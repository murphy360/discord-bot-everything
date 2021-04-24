const Exercise = require('./../classes/exercise.js');


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
    let exerciseName = args[3].toLowerCase()
    let exerciseDescription = args[4].toLowerCase()
    let exerciseImage = args[5].toLowerCase()

    if (subCommand === "add") {
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
      
    } else if (subCommand === "remove"){
      
					this.MESSAGE.channel.send("Sorry, remove is not a current functio, but we're thinking about it...")
    }
  
  },
};
