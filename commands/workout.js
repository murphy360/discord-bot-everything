const { Workout } = require("../classes/workout.js");

module.exports = {
  name: 'workout',
  description: 'Create a Workout',
  async execute(msg, args) {
    
    //args[0] = @botname
    //args[1] = 'workout'
    //args[2] = sets
    //args[3] = reps
    //args[4...n] = exercises
    let workout = new Workout(msg, args);

    if (workout.isValid()) {
      msg.channel.send('The Workout is valid')
    } else { 
      msg.channel.send('The Workout is not valid')
    }
    	  
  },
};
