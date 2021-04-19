const { Workout } = require("../classes/workout.js");

module.exports = {
  name: 'workout',
  description: 'Create a Workout',
  async execute(msg, args) {
    
    //args[0] = @botname
    //args[1] = 'workout'
    //args[2] = sets
    //args[3...n] = exercises
    //args[3+1..n+1] = reps
    let workout = new Workout(msg, args);
    console.info("Workout command post new Workout")

    if (workout.isValid) {
      let messageString = 'Get Ready! \n ' + workout.sets + " rounds:"
      for (let i = 0; i < workout.EXERCISES.length ; i++) {
        messageString = messageString + '\n' + workout.EXERCISES[i].name + ": " + workout.EXERCISES[i].REPS + " reps"
      }
      msg.channel.send(messageString)
    } else { 
      msg.channel.send('The Workout is not valid')
    }
    	  
  },
};
