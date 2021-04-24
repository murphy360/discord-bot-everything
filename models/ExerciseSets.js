module.exports = (sequelize, Sequelize) => {
	return sequelize.define('exercise_sets', {
		set_id: {
			type: Sequelize.STRING,
		},
		exercise_id: {
			type: Sequelize.STRING,
		},
		workout_id: {
			type: Sequelize.STRING,
		},
		user_id: {
			type: Sequelize.STRING,
		},
		reps: {
			type: Sequelize.STRING,
		},
		weight: {
			type: Sequelize.STRING,
		},
		set_start: {
			type: Sequelize.DATE,
		},
		set_end: {
			type: Sequelize.DATE,
		}
	}, {
		timestamps: false,
	});
};
