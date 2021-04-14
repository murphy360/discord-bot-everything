const Discord = require('discord.js');
const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'joke',
  description: 'Random Joke',
  async execute(msg, args) {
    fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes', { 
      method: 'GET'})
      .then(response => { return response.json(); })
      .then(json => {
        joke = new Discord.MessageEmbed()
          .setAuthor("Joke Bot")
          .setColor("#c5f542")
          .setTitle(json.setup)
	  .setThumbnail("https://repository-images.githubusercontent.com/193169245/5462aa00-f356-11e9-846d-551973c550a6")
      
        msg.channel.send(joke).then(j => { 
          joke.setDescription(json.punchline); 
	  joke.setFooter("Joke provided by https://dadsofunny.firebaseapp.com","https://repository-images.githubusercontent.com/193169245/5462aa00-f356-11e9-846d-551973c550a6");
          setTimeout(function () {j.edit(joke)}, 7000); 
        });
    
                    
    });
  },
};
