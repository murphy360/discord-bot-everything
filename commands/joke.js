const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'joke',
  description: 'Random Joke',
  async execute(msg, args) {
    fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes', { 
      method: 'GET'})
      .then(function(response) { return response.json(); })
      .then(function(json) {
        msg.channel.send(json.setup);
        msg.channel.send(json.punchline);
        });
  },
};