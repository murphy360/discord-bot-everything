module.exports = (sequelize, Sequelize) => {
	return sequelize.define('servers', {
		server_id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		server_name: {
			type: Sequelize.STRING,
		},
	}, {
		timestamps: false,
	});
};
