const Exercise = require('./../classes/exercise.js');
const Discord = require('discord.js');
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
        this.sets=parseInt(args[2], 10)
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
                console.info("Exercise length: " + this.EXERCISES.length)
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

    messageWorkoutDetails(){
        let workoutDetailsString = 'Complete ' + this.sets + ", " + this.setTime + "-minute rounds:"
        let exerciseString = ""
        let repString = ""
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            exerciseString += this.EXERCISES[i].name + "\n"
            repString += this.EXERCISES[i].REPS + "\n"
        }
                
        const workoutDetails = new Discord.MessageEmbed()
                            .setTitle(this.MESSAGE.author.username + "Has started a workout!")
                            .setColor("#0099ff")
                            .setDescription(workoutDetailsString)
                            .addFields(
                                {name: "Exercise", value: exerciseString, inline: true},
                                {name: "Reps", value: repString, inline: true}
                            );
        this.MESSAGE.channel.send(workoutDetails)		
    }

    messageRoundDetails(roundString){

        let descriptionString = "In " + this.setTime + "-minutes, complete:"

        let exerciseString = ""
        let repString = ""
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            exerciseString += this.EXERCISES[i].name + "\n"
            repString += this.EXERCISES[i].REPS + "\n"
        }

        const roundDetails = new Discord.MessageEmbed()
                            .setTitle(roundString)
                            .setColor("#0099ff")
                            .setDescription(descriptionString)
                            .addFields(
                                {name: "Exercise", value: exerciseString, inline: true},
                                {name: "Reps", value: repString, inline: true}
                            );
        this.MESSAGE.channel.send(roundDetails)	
    }

    messageFinishedDetails(){

        let descriptionString = "In " + this.setTime*this.sets + ", completed " + this.sets + " sets and total reps:"

        let exerciseString = ""
        let repString = ""
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            exerciseString += this.EXERCISES[i].name + "\n"
            repString += this.EXERCISES[i].REPS*this.sets + "\n"
        }

        const finishedDetails = new Discord.MessageEmbed()
                            .setTitle("Workout Complete!")
                            .setColor("#0099ff")
                            .setDescription(descriptionString)
                            .addFields(
                                {name: "Exercise", value: exerciseString, inline: true},
                                {name: "Reps", value: repString, inline: true}
                            );
        this.MESSAGE.channel.send(finishedDetails)	
    }


    startSet(){
        this.currentSet++
        console.info("Current Set: " + this.currentSet + "Total Sets: " + this.sets + "Equal?? " + (this.currentSets === this.sets))
        
        if(this.currentSet > this.sets){
            clearInterval(this.INTERVAL)
            this.messageFinishedDetails()
            return
        } else if (this.currentSet === this.sets) {
            this.messageRoundDetails("Final Round!")
        } else {
            this.messageRoundDetails('Round ' + this.currentSet)
        }
    }

// Start Publishing exercise on periodic basis
    startWorkout() {
                                    
        let interval = (this.setTime * 60) * 1000
    // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send("\n\n************\n\nStarting in " + this.setTime + " minutes.").then( embed => { 
            this.INTERVAL = setInterval(this.startSet.bind(this), interval);
        });
    }

    stopWorkout() {

    }

}

module.exports.Workout = Workout;
