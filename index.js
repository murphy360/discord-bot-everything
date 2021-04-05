require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

var version = '0.1';

//link up commands found in ./commands/
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

//Callback when bot joins the server TODO channelID should be automatically discovered
bot.on('ready', () => {
  const channelID = "828303498994647134"
  bot.channels.cache.get(channelID).send('I have arrived!');
  bot.channels.cache.each(channel => console.info(channel.id));

});

//Callback when bot reads a message
//Split by whitespac
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
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
  
});
