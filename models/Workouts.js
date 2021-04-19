module.exports = (sequelize, Sequelize) => {
	return sequelize.define('workouts', {
		workout_id: {
			type: Sequelize.STRING,
			primaryKey: true,
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
		},
		server_id: {
			type: Sequelize.STRING,
		}
	}, {
		timestamps: false,
	});
};
