const Exercise = require('./../classes/exercise.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

module.exports = {
  name: 'exercise',
  description: 'Adding and removing exercises',
  async execute(msg, args) {
   
    let subCommand = args[2].toLowerCase()
    let exerciseName = args[3].toLowerCase()

    if (subCommand === "add") {
      //how to find a user in the db
			let exerciseSearchCriteria = { where: {
				exercise_name: stringName
			}};
      	//if this is the user's first time on the bot then log them. 
			// TODO could look into checking if this is the first time on the server / if they are on other servers
			Exercises.findOne(exerciseSearchCriteria).then(value => {
				if (value === null) {
					//first time user on this bot
					this.MESSAGE.channel.send("Sorry, " + stringName + " is not a current exercise, ask an admin to add it")
				} else {
					console.info('Exercise already resides on the server')
          return value
				}
			});
      
    } else if (subCommand === "remove"){
      
					this.MESSAGE.channel.send("Sorry, remove is not a current functio, but we're thinking about it...")
    }
  
  },
};
