const { Model, DataTypes, Deferrable } = require("sequelize");
class Exercise extends Model {
	//class leve Method
	static listExercises(discordChannel) {
		console.info("List Exercises Method")
		this.CHANNEL=discordChannel
		this.findAll().then(exerciseDbObjectsList => {
			let exerciseListString = ''
			if (exerciseDbObjectsList === null) {
				//first time user on this bot
				this.CHANNEL.send('No Exercises exist - null')
			} else if (exerciseDbObjectsList.length === 0 ) {
				this.CHANNEL.send('No Exercises exist - 0')
			}else {
				console.info(exerciseDbObjectsList.length + ' Exercises already reside on the server')
				console.info(exerciseDbObjectsList[0].name + " is the first one")
				exerciseDbObjectsList.every(exercise => exerciseListString += exercise.name + ": " + exercise.description + ": " + exercise.image + "\n")
				
				console.info(exerciseListString)
		
				const exerciseListMessage = new Discord.MessageEmbed()
									.setTitle("Available Exercises")
									.setColor(WORKOUT_COLOR)
									.setDescription("Below are a list of available exercises, message an admin to have new Exercises Added")
									.addField("Exercise ", exerciseListString)
								   
				this.MESSAGE.channel.send(exerciseListMessage)	
			}
		});
	}
	instanceLevelMethod() {
	  return 'bar';
	}
	getFullname() {
	  return [this.firstname, this.lastname].join(' ')
	}
}

	Exercise.init({
		name: Sequelize.STRING,
		description: Sequelize.STRING,
		image: Sequelize.STRING,
	}, { sequelize }
	);

  module.exports.Exercise = Exercise