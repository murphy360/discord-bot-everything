module.exports = (sequelize, Sequelize) => {
	return sequelize.define('workouts', {
		workout_id: {
			type: Sequelize.STRING,
		},
		server_id: {
			type: Sequelize.STRING,
		},
		creator_id: {
			type: Sequelize.STRING,
		},
		creator_name: {
			type: Sequelize.STRING,
		},
		workout_start: {
			type: Sequelize.DATE,
		},
		workout_end: {
			type: Sequelize.DATE,
		}
	}, {
		timestamps: false,
	});
};
