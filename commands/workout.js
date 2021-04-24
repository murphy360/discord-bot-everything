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
    let workout = new Workout(msg, args)
    workout.buildExerciseList(args).then(valid => {
      if (valid) {
        console.info('isvalid')
        workout.messageWorkoutDetails()
        workout.startWorkout()
      } else { 
        
        console.info('isNOTvalid')
        msg.channel.send('The Workout is not valid')
      }    
    })
    console.info("Workout command post new Workout")
   

    
    
     
    	  
  },
};
