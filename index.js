require('dotenv').config();
const greetings = require('greetings');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

var version = '0.1';

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
	 	storage: 'database.sqlite',
});

const Games = require('./models/Games')(sequelize, Sequelize.DataTypes);
const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Questions = require('./models/Questions')(sequelize, Sequelize.DataTypes);
const Responses = require('./models/Responses')(sequelize, Sequelize.DataTypes);
const Servers = require('./models/Servers')(sequelize, Sequelize.DataTypes);


//link up commands found in ./commands/
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

//Callback when bot joins the server TODO channelID should be automatically discovered
bot.on('ready', () => {
  const channelID = "828303498994647134"
  bot.channels.cache.get(channelID).send(greetings());
  const toSync = false;
  Games.sync({ force: toSync });
  Users.sync({ force: toSync });
  Questions.sync({ force: toSync });
  Responses.sync({ force: toSync });
  Servers.sync({ force: toSync });
//  bot.user.setAvatar('avatar.jpg');
});

//Callback when bot reads a message
//Split by whitespace
//Check that someone mentioned @botName in first postion (Ignore if not)
//Check that position 2 [1] has command that the bot can recognize
//Try to execute command catch erros as well as you can. 
bot.on('message', msg => {
  const args = msg.content.split(" ");
  var botName = args[0].toLowerCase().replace(/\D/g,'');

  if(bot.user.id != botName){
      return;
  }
  const command = args[1].toLowerCase();
  console.info(`index.js - Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
	  bot.commands.get(command).execute(msg, args, bot);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
  
});
