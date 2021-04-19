class Exercise {
 
    constructor(exerciseName, exerciseDescription, exerciseImage, discordMessage) {
        this.name=exerciseName                          // Name of Exercise
        this.description=exerciseDescription            // Short Description of Exercise
        this.image=exerciseImage                        //optional 
        this.MESSAGE=discordMessage                    // original message from user
        this.REPS
    }


// Save executed exercise to database
    logExercise(reps, time, user) {
        
        return bar;
    }


// Starts a new set of an exercise
    newExerciseSet(){
        
    }

    setReps(repetitions){
        this.REPS=repetitions
    }

// Start Publishing exercise on periodic basis
    startExercise(reps, periodicity, sets, message) {
                                         

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

    stopExercise() {

    }

}

module.exports.Exercise = Exercise;
