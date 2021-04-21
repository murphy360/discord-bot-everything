const fetch = require('node-fetch');
const he = require('he');
const { json } = require('sequelize');
const Discord = require('discord.js');

module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {
    
    async function sendEmbedPokemonMessage(message, json) {
      //create and format new embedded message 

	//get abilities from the json provided
	ability=""
	for (let i=0;i<json.profile.ability.length;i++) {
		ability+=json.profile.ability[i][0]+"\n"
	}

      const messageEmbed = new Discord.MessageEmbed()
      .setColor('#ffcb05')      // Changed the color to the Pokemon yellow (just for fun)
      .setAuthor('Found in the wild!')
      //.addFields({name: 'Type', json.type})
      .setTitle(json.name.english)
      .setURL("https://www.pokemon.com/us/pokedex/"+json.name.english)
      .setDescription(json.description)
      .setImage(he.decode(json.hires))
      .addFields(
	      {name:"__Species__",value:json.species,inline:true},
	      {name:"__Type__",value:json.type,inline:true},
	      {name:"__Ability__",value:ability,inline:true},
	      {name:"__HP__",value:json.base.HP,inline:true},
              {name:"__Defense__",value:json.base.Defense,inline:true},
              {name:"__Attack__",value:json.base.Attack,inline:true},
              {name:"__Sp. Attack__",value:json.base['Sp. Attack'],inline:true},
              {name:"__Sp. Defense__",value:json.base['Sp. Defense'],inline:true},
              {name:"__Speed__",value:json.base.Speed,inline:true},
      )
      .setFooter("Pokemon data provided by: https://purukitto.github.io/pokemon-api/")
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


	
		
