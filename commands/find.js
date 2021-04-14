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

        console.info(json.hires);
        //let imageUrl = json.sprite.split('hires');
        //console.info(imageUrl[0]);
        //console.info(imageUrl[1]);
       
        const messageEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor('Found a wild!')
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


	
		