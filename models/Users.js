module.exports = (sequelize, Sequelize) => {
	return sequelize.define('users', {
		user_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		user_name: {
			type: Sequelize.STRING,

		}
	}, {
		timestamps: false,
	});
};
