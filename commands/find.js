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
      const pokemonId = Math.floor(Math.random() * 897) + 1;
      fetch('https://pokeapi.co/api/v2/pokemon/'+pokemonId).then(response => {
        console.info('got something');
        //console.info(response);
        console.info(JSON.stringify(response));
        msg.channel.send(response.name);	 
      });   
    }
  },
};