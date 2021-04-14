const fetch = require('node-fetch');
const { json } = require('sequelize');

const Math = require('math');
module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {
    console.info("Inside find ");
    if (!args[2]){
      msg.channel.send("What should I find?");
    } else if (args[2] === 'pokemon'){
      console.info('find pokemon');
      //const pokemonId = Math.floor(Math.random() * 897) + 1;
      const { json } = await fetch("https://app.pokemon-api.xyz/pokemon/random").then(response => response.text()).then(msg.channel.send(json));
      console.info('Random Pokemon');
       
    } else if (args[2] === 'cat') {
      const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
      console.info('Random Cat');
      msg.channel.send('Random Cat');
      msg.channel.send(file);	  
    }
  },
};