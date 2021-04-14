const Discord = require('discord.js');
const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'joke',
  description: 'Random Joke',
  async execute(msg, args) {

    function sendDadJoke(){
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
    }

    function sendJokeApiJoke(){
      fetch('https://v2.jokeapi.dev/joke/Any?format=xml?type=twopart', { 
        method: 'GET'})
        .then(response => { return response.json(); })
        .then(json => {
          joke = new Discord.MessageEmbed()
            .setAuthor("Bot's Got Jokes")
            .setColor("#c5f542")
            .setTitle(json.setup)
      .setThumbnail("https://sv443.net/resources/images/jokeapi.webp")
        
          msg.channel.send(joke).then(j => { 
            joke.setDescription(json.delivery); 
      joke.setFooter("Joke provided by https://sv443.net/jokeapi/","https://sv443.net/");
            setTimeout(function () {j.edit(joke)}, 7000); 
          });            
      });
    }
    if (args[2] === null) {
      let apiNum = Math.floor(Math.random() * (2 - 1 + 1));
      if (apiNum === 1) {
        sendDadJoke();
      } else {
        sendJokeApiJoke();
      }
    } else if (args[2] === 'dad') {
      sendDadJoke();
    } else {
      try {
        sendJokeApiJoke(args[2]);
      } catch (e) {
        msg.channel.send("Sorry I don't have that category /n Try: nsfw, religious, political, racist, sexist, explicit");
      }
    }
  },
};
