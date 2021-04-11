const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {
    
    const { file } = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=?').then(response => response.json());
    console.info('Random Cat');
    msg.channel.send('Random Cat');
    msg.channel.send(file);	  

    console.info('Random Joke: ' + file);
    msg.channel.send('Random Joke');
    msg.channel.send(file);	  
  },
};
