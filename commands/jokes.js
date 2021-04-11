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
        var jokeObject = JSON.parse(json);
        console.info(JSON.stringify(jokeObject));
        console.info("joke: " + jokeObject.text);
      msg.channel.send('Random Cat');
      msg.channel.send(file);	  

      console.info('Random Joke: ' + file);
      msg.channel.send('Random Joke');
      msg.channel.send(file);	  
        });
    
  },
};
