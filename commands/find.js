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
      fetch("https://pokemon-go1.p.rapidapi.com/pokemon_stats.json", {
        "method": "GET",
        "headers": {
          "x-rapidapi-key": "9ded9c1174mshe1831826938f2f2p12da78jsnc5deaf9eb058",
          "x-rapidapi-host": "pokemon-go1.p.rapidapi.com"
        }
      })
      .then(response => {
        pokemonJson = await response.json(); 
        console.log(pokemonJson);
        //console.log(JSON.parse(response));
      })
      .catch(err => {
        console.error(err);
      });
    }
  },
};