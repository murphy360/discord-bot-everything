const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
		storage: 'database.sqlite',
});

const Games = require('./models/Games')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds')(sequelize, Sequelize.DataTypes);
const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Questions = require('./models/Questions')(sequelize, Sequelize.DataTypes);
//const Responses = require('./models/Responses')(sequelize, Sequelize.DataTypes);

//Questions.belongToMany(Games, (through: 'Responses' });
//Games.belongToMany(Questions, (through: 'Responses' });
//Questions.belongToMany(Users, (through: 'Responses' });
//Users.belongToMany(Questions, (through: 'Responses' });
//Games.belongToMany(Users, (through: 'Responses' });
//Users.belongToMany(Games, (through: 'Responses' });


// force true will remake database every time
const force = true;

sequelize.sync({ force }).then(async () => {
		console.log('Database synced');
		sequelize.close();
}).catch(console.error);
