const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {
    
    fetch('https://icanhazdadjoke.com/slack', { 
      method: 'GET'})
      .then(function(response) { return response.json(); })
      .then(function(json) {
        console.info('Random Joke ' + JSON.stringify(json));
        
        console.info("joke: " + json.attachments[0].text);
        msg.channel.send(json.attachments[0].text);
        });
    
  },
};
