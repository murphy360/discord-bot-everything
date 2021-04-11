const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {
    
    const { file } = await fetch('https://dad-jokes.p.rapidapi.com/random/joke').then(response => {
      return response
  });
    console.info('Random Joke: ' + file);
    msg.channel.send('Random Joke');
    msg.channel.send(file);	  
  },
};
