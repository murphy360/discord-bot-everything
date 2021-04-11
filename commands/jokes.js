const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {

    const file = await fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes').then(response => response.json());
    console.info('Random Joke: ' + file);
    msg.channel.send('Random Joke');
    msg.channel.send(file);	  
  },
};
