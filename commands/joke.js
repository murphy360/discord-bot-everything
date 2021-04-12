const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'joke',
  description: 'Random Joke',
  async execute(msg, args) {
    
    fetch('https://icanhazdadjoke.com/slack', { 
      method: 'GET'})
      .then(function(response) { return response.json(); })
      .then(function(json) {
        msg.channel.send(json.attachments[0].text);
        });
  },
};
