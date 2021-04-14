const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {
    let findCommand = args[2];
    console.info("Inside find " + findCommand);
    if (!findCommand){
      msg.channel.send("What should I find?");
    } if (findCommand === 'pokemon'){
      const pokemonId = rand(1, 898);
      const { file } = await fetch('https://api.pokemon.com/us/pokedex/'+pokemonId).then(response => response.json());
      console.info('Random Pokemon');
      console.info(JSON.stringify(file));
      msg.channel.send(file);	  
    }
    
  },
};