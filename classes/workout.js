const Exercise = require('./../classes/exercise.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
const Workouts = require('../models/Workouts')(sequelize, Sequelize.DataTypes);
const ExerciseSets = require('../models/ExerciseSets')(sequelize, Sequelize.DataTypes);
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
        this.ATHLETES=[]
        this.color='FF0000'
        this.INTERVAL
        this.intervalTime = (this.setTime * 60) * 1000
        this.icon='https://previews.123rf.com/images/kongvector/kongvector2003/kongvector200300022/141391692-independence-day-drum-mascot-icon-on-fitness-exercise-trying-barbells-vector-illustration.jpg'
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

	/*** Log Workout: save reference to thisworkout to db ***/
    async logWorkout() {
			
        
        //Create an entry in the database for this workout. Log asyncronously when result is returned. 
        Workouts.create({
            workout_id: this.MESSAGE.id,
            creator_id: this.MESSAGE.author.id,
            creator_name: this.MESSAGE.author.username,
            workout_start: this.MESSAGE.createdAt,
            workout_end: Date.now(),
            server_id: this.MESSAGE.guild.id,
        }).then(value => console.info('Workout ' + value.workout_id + ' was created in the database'));
    }

    	/*** Log Game: save reference to this game to db ***/
    async logSet(message, user, exerciseId, reps, weight) {
        //Create an entry in the database for this set (you get one entry per user+round+exercise)
        ExerciseSets.create({
            exercise_id: exerciseId,
            workout_id: this.MESSAGE.id,
            user_id: user.id,
            server_id: this.MESSAGE.guild.id,
            reps: reps,
            weight: weight,
            reps: reps,
            set_start: message.createdAt,
            set_end: Date.now(),
        }).then(value => console.info('Set ' + value.exercise_id + ' was created in the database'));
    }

    getExercise(stringName) {
        
        
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
                            .setTitle(this.MESSAGE.author.username + " Has started a workout!")
                            .setColor(this.color)
                            .setDescription(workoutDetailsString)
                            .setThumbnail(this.icon)
                            .addFields(
                                {name: "Exercise", value: exerciseString, inline: true},
                                {name: "Reps", value: repString, inline: true}
                            );
        this.MESSAGE.channel.send(workoutDetails)		
    }

    async messageRoundDetails(roundString){

        let descriptionString = "In " + this.setTime + "-minutes, complete:"

        let exerciseString = ""
        let repString = ""
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            exerciseString += this.EXERCISES[i].name + "\n"
            repString += this.EXERCISES[i].REPS + "\n"
        }

        const roundDetails = new Discord.MessageEmbed()
                            .setTitle(roundString)
                            .setColor(this.color)
                            .setDescription(descriptionString) 
                            .setThumbnail(this.icon)
                            .addFields(
                                {name: "Exercise", value: exerciseString, inline: true},
                                {name: "Reps", value: repString, inline: true}
                            );
        let roundMessage = await this.MESSAGE.channel.send(roundDetails)
        roundMessage.react('✅')	
        
        const filter = (reaction, user) => {
            //make sure each player has an entry and we're not tracking bots
            let athleteInGym = this.ATHLETES.some(athlete => athlete.id === user.id)
            console.info(user.username + ' is already in the gym')
            if (!user.bot && !athleteInGym){
                console.info('adding ' + user.username + ' to athletes list');
                this.ATHLETES.push(user)
                //userNameId.set(user.id,user.username);
                this.MESSAGE.channel.send('Thanks for joining us ' + user.username)
                console.info('added ' + user.username + ' to athlete list')
            }
            // Selected check emoji and not a bot
            if (reaction.emoji.name === '✅' && !user.bot) {
                console.info(user.username + ' finished a round');
                return true;
            } else {
                console.info(user.username + ' is being ignored');
            }
        }
        const collector = roundMessage.createReactionCollector(filter, { time: this.intervalTime*10 });
				collector.on('collect', (reaction, user) => {
					
                    //Log a user as finishing a round
                    for (let i = 0; i < this.EXERCISES.length ; i++) {
                        this.logSet(roundMessage, user, this.EXERCISES[i].name, this.EXERCISES[i].REPS, this.EXERCISES[i].weight)
                    }
                    
                    //Give them an attaboy 
                    const attaboyMessage = new Discord.MessageEmbed()
						.setTitle("Nailed It!")
						.setColor("#0099ff")
                        .setDescription('Great job ' + user.username)

					this.MESSAGE.channel.send(attaboyMessage)
                    
				});

				collector.on('end', collected => {
					
					console.info('on end');
					
				});
    }

    messageFinishedDetails(){

        let descriptionString = this.setTime*this.sets + " minutes\n " + this.sets + " sets"

        let exerciseString = ""
        let repString = ""
        for (let i = 0; i < this.EXERCISES.length ; i++) {
            exerciseString += this.EXERCISES[i].name + "\n"
            repString += this.EXERCISES[i].REPS*this.sets + "\n"
        }

        const finishedDetails = new Discord.MessageEmbed()
                            .setTitle("Workout Complete!")
                            .setColor(this.color)
                            .setDescription(descriptionString)
                            .setThumbnail(this.icon)
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
            this.logWorkout()
            return
        } else if (this.currentSet === this.sets) {
            this.messageRoundDetails("Final Round!")
        } else {
            this.messageRoundDetails('Round ' + this.currentSet)
        }
    }

// Start Publishing exercise on periodic basis
    startWorkout() {
                                    
        
    // Create the message then, use setInterval to update the message
        this.MESSAGE.channel.send("First Round Starting in " + this.setTime + " minutes.").then( embed => { 
            //this.startSet() can start workout immediate, otherwise first round starts after first interval
            this.INTERVAL = setInterval(this.startSet.bind(this), this.intervalTime);
        });
    }

    stopWorkout() {

    }

}

module.exports.Workout = Workout;
