module.exports = (sequelize, Sequelize) => {
	return sequelize.define('questions', {
		question_id: {
			type: Sequelize.STRING,
			unique: true,
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
		category: {
			type: Sequelize.STRING
		},
		difficulty: { 
			type: Sequelize.STRING
		},
	});
};
