const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {
    console.info("Inside find ");
    if (!args[2]){
      msg.channel.send("What should I find?");
    } else if (args[2] === 'pokemon'){
      console.info('find pokemon');
      const pokemonId = rand(1, 898);
      const { file } = await fetch('https://api.pokemon.com/us/pokedex/'+pokemonId).then(response => response.json());
      console.info('Random Pokemon');
      console.info(JSON.stringify(file));
      msg.channel.send(file);	  
    }
    
  },
};