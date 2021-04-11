const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {
    
    let response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=?');
    
    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      console.info('ok');
      let json = await response.json();
    } else {
      console.info('Error: ' + response.status);
      
    }

    console.info('Random Joke: ' + file);
    msg.channel.send('Random Joke');
    msg.channel.send(file);	  
  },
};
