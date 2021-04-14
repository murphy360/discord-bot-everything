const fetch = require('node-fetch');
const he = require('he');
const { json } = require('sequelize');
const Discord = require('discord.js');

const Math = require('math');
module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {
    
    async function sendEmbedPokemonMessage(message, json) {
      //create and format new embedded message 
      const messageEmbed = new Discord.MessageEmbed()
      .setColor('##ffcb05')      // Changed the color to the Pokemon yellow (just for fun)
      .setAuthor('Found in the wild!')
      //.addFields({name: 'Type', json.type})
      .setTitle(json.name.english)
      .setThumbnail(he.decode(json.hires))
      .addFields(
        {name:"Species",value:json.species},
        {name:"Type",value:json.type},
        {name:"HP",value:json.base.HP,inline:true},
        {name:"Defense",value:json.base.Defense,inline:true},
        {name:"Attack",value:json.base.Attack,inline:true},
        {name:"Sp. Attack",value:json.base['Sp. Attack'],inline:true},
        {name:"Sp. Defense",value:json.base['Sp. Defense'],inline:true},
        {name:"Speed",value:json.base.Speed,inline:true},
        {name:"Description",value:json.description}
      )
      .setFooter("API provided by: https://purukitto.github.io/pokemon-api/")
        message.channel.send(messageEmbed);
    }
    //if command is only "@bot find" then:
    if (!args[2]){
      msg.channel.send("What should I find?");
      //@bot find pokemon
    } else if (args[2] === 'pokemon'){
      
      //Make an API call for a single random Pokemon
      await fetch("https://app.pokemon-api.xyz/pokemon/random")
      .then(response => response.text())
      //create a JSON object
      .then(json => JSON.parse(json))
      .then(json => sendEmbedPokemonMessage(msg, json)); 

    } else if (args[2] === 'cat') {
      const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
      msg.channel.send('Random Cat');
      msg.channel.send(file);	  
      
    }
  },
};


	
		
