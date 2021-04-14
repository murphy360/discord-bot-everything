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
          const joke = new Discord.MessageEmbed()
            .setAuthor(msg.author.username+" wants jokes") 
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

    function sendJokeApiJoke(category){
      console.info("Category: " + category);
      fetch('https://v2.jokeapi.dev/joke/'+category+'?format=xml?type=twopart?blacklistFlags=racist,nsfw,explicit', { 
        method: 'GET'})
        .then(response => { return response.json(); })
        .then(json => {
          console.info(json);
          if (json.error === false) {
              const joke = new Discord.MessageEmbed()
              .setAuthor(msg.author.username+" wants jokes")
              .setColor("#c5f542")
              .setTitle(json.setup)
              .setThumbnail("https://sv443.net/resources/images/jokeapi.webp")
              msg.channel.send(joke).then(j => { 
              joke.setDescription(json.delivery); 
              joke.setFooter("Joke provided by https://sv443.net/jokeapi/","https://sv443.net/");
              setTimeout(function () {j.edit(joke)}, 7000); 
            });   
         } else {
            msg.channel.send("Sorry something wrong witherh the joke /n Try joke [programming, misc, pun, dark, spooky, christmas]");
         }     
      });
    }

    console.info("ARGS: " + args[2]);
    if (args[2] === undefined) {
      let max = 2;
      let min = 1;
      let apiNum = Math.floor(Math.random() * (max - min + 1) + min);
      console.info("integer: " + apiNum);
      if (apiNum === 1) {
        sendDadJoke();
      } else {
        sendJokeApiJoke("Any");
      }
    } else if (args[2] === 'dad') {
      console.info('dad specific');
      sendDadJoke();
    } else {
      try {
        console.info('Category Specific');
        sendJokeApiJoke(args[2]);
      } catch (e) {
        
      }
    }
  },
};
