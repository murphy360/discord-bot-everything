class Workout {

    //args[0] = @botname
    //args[1] = 'workout'
    //args[2] = sets
    //args[3] = reps
    //args[4...n] = exercises
 
    constructor(discordMessage, args) {
        this.MESSAGE=discordMessage
        this.coach=discordMessage.author
        this.sets=args[2]
        this.reps=args[3]  
        this.isValid=false 
        this.EXERCISES=[]                      
        for (let i = 4; i < args.length ; i++) {
            let exercise = this.getExercise(args[i])
            if ( exercise !== null) {
                this.EXERCISES.push(exercise)
            } else { 
                discordMessage.channel.send("Not all exercises are valid: " + exercise)
                this.isValid=false
            }
        }                
    }


// Save executed exercise to database
    logWorkout() {
        
        return bar;
    }

    getExercise(stringName) {
        //Check database to see if this exercise exists
        let exercise = null;
        return exercise;
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
