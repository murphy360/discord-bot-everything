require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const ytdl = require("ytdl-core");
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

var servers = {};
var version = '0.1';

const PREFIX = '!';

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

  bot.on('ready', () => {
     console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  const args = msg.content.split(" ");
  var botName = args[0].toLowerCase().replace(/\D/g,'');
  console.info('botname: ' + botName + ' ' + bot.user.id);

  if(bot.user.id != botName){
  
      console.info('Not My Name');
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
