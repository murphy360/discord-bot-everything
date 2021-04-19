const Exercise = require('./../classes/exercise.js');
class Workout {

    //args[0] = @botname
    //args[1] = 'workout'
    //args[2] = sets
    //args[3...n] = exercises
    //args[3+1...n+1] = exercise reps
 
    constructor(discordMessage, args) {
        this.MESSAGE=discordMessage
        this.coach=discordMessage.author
        this.sets=args[2]
        this.isValid=false 
        this.EXERCISES=[]                      
        for (let i = 3; i < args.length ; i+=2) {
            let exercise = this.getExercise(args[i])
            if ( exercise === null) {
                discordMessage.channel.send("Not all exercises are valid: " + args[i] + '! \n Add it Through the Add Exercise Command')
                this.isValid=false
            } else if(isNaN(args[i+1])) { 
                discordMessage.channel.send("Reps aren't valid for " + args[i] + '! ' + args[i+1])
                this.isValid=false
            } else {
                exercise.setReps(args[i+1])
                this.EXERCISES.push(exercise)
            }
        }                
    }


// Save executed exercise to database
    logWorkout() {
        
        return false
    }

    getExercise(stringName) {
        //Check database to see if this exercise exists create an exercise Object and return
        let exercise = new Exercise.Exercise(stringName, "", "", this.MESSAGE)
        return exercise
    }


// Start Publishing exercise on periodic basis
    startWorkout() {
                                         

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

    stopWorkout() {

    }

}

module.exports.Workout = Workout;
