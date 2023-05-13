module.exports = (sequelize, Sequelize) => {
	return sequelize.define('questions', {
		question_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		source: {
			type: Sequelize.TEXT
		},
		source_url: {
			type: Sequelize.TEXT
		},
		source_id: {
			type: Sequelize.TEXT
		},
		question_url: {
			type: Sequelize.TEXT
		},
		question_type: {
			type: Sequelize.TEXT
		},
		category: {
			type: Sequelize.STRING
		},
		difficulty: { 
			type: Sequelize.STRING
		},
		question: {
			type: Sequelize.TEXT
		},
		correct_answer: {
			type: Sequelize.TEXT
		},
		answer2: {
			type: Sequelize.TEXT
		},
		answer3: {
			type: Sequelize.TEXT
		},
		answer4: {
			type: Sequelize.TEXT
		},
		times_asked: { 
			type: Sequelize.INTEGER
		},
		times_answered: { 
			type: Sequelize.INTEGER
		},
		times_answered_correctly: { 
			type: Sequelize.INTEGER
		},
		last_asked: {
			type: Sequelize.DATE,
		},
		owner_user_id: {
			type: Sequelize.TEXT
		},
		owner_guild_id: {
			type: Sequelize.TEXT
		},
	});
};
