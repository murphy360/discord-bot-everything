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
        console.info("joke: " + json.attachments.text);
      //msg.channel.send('Random Cat');
      //msg.channel.send(file);	  
        });
    
  },
};
