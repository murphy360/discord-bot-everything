module.exports = (sequelize, Sequelize) => {
	return sequelize.define('exercises', {
		exercise_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		exercise_id: {
			type: Sequelize.STRING,
		},
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
