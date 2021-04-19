const Exercise = require('./../classes/exercise.js');
class Workout {

    //args[0] = @botname
    //args[1] = 'workout'
    //args[2] = sets / type (AMRAP)
    //args[3] = setTime / AMRAP Time
    //args[3...n] = exercises
    //args[3+1...n+1] = exercise reps
 
    constructor(discordMessage, args) {
        console.info("Workout Constructor")
        this.MESSAGE=discordMessage
        this.coach=discordMessage.author
        this.sets=args[2]
        this.setTime=args[3]
        this.isValid=false 
        this.EXERCISES=[] 
        this.INTERVAL
        this.currentSet=0                     
        for (let i = 4; i < args.length ; i+=2) {
            
            console.info("Workout Class For Loop: " + args[i])
            let exercise = this.getExercise(args[i])
            if ( exercise === null) {
                discordMessage.channel.send("Not all exercises are valid: " + args[i] + '! \n Add it Through the Add Exercise Command')
                this.isValid=false
            } else if(isNaN(args[i+1])) { 
                discordMessage.channel.send("Reps aren't valid for " + args[i] + '! ' + args[i+1])
                this.isValid=false
            } else {
                this.isValid=true
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

    startSet(){
        this.currentSet++
        let messageString = 'Round ' + this.currentSet + "/n, In " + this.setTime + "-minutes complete:"
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            messageString = messageString + '\n     ' + this.EXERCISES[i].REPS + " " + this.EXERCISES[i].name
        }
        this.MESSAGE.channel.send(messageString)
    }

// Start Publishing exercise on periodic basis
    startWorkout() {
                                    
        let interval = (this.setTime * 60) * 1000

 
        
    // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send("starting now").then( embed => { 
            this.INTERVAL = setInterval(this.startSet, interval);
        });
    }

    stopWorkout() {

    }

}

module.exports.Workout = Workout;
