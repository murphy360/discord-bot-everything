module.exports = (sequelize, Sequelize) => {
	return sequelize.define('exercises', {
		exercise_name: {
			type: Sequelize.STRING,
		},
		exercise_description: {
			type: Sequelize.STRING,
		},
		exercise_image: {
			type: Sequelize.STRING,
		}
	}, {
		timestamps: false,
	});
};
