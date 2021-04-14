const fetch = require('node-fetch');
const he = require('he');
const { json } = require('sequelize');
const Discord = require('discord.js');

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
      await fetch("https://app.pokemon-api.xyz/pokemon/random")
      .then(response => response.text())
      .then(json => JSON.parse(json))
      //.then(json => msg.channel.send(json))
      .then(json => {
       
        const messageEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor('Found a wild!')
          //.addFields({name: 'Type', json.type})
          .setTitle(json.name.english)
          .setThumbnail(he.decode(json.sprite))
          //.setImage(he.decode(json.sprite))
				  .addField("HP: "+json.base.HP)
          .addField("Attack: "+json.base.Attack)
          .addField("Defense:  "+json.base.Defense)
          .addField("Species: "+json.species)
          .setFooter("Data provided by: https://purukitto.github.io/pokemon-api/")
          msg.channel.send(messageEmbed);
      });
      console.info('Random Pokemon');
       
    } else if (args[2] === 'cat') {
      const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
      console.info('Random Cat');
      msg.channel.send('Random Cat');
      msg.channel.send(file);	  
      
    }
  },
};


	
		