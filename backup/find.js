const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const he = require('he');
const { json } = require('sequelize');


module.exports = {
 
	data: new SlashCommandBuilder()
		.setName('find')
		.setDescription('Finds Things'),
	async execute(interaction) {
    
    const pokedex = new Pokedex();
    async function getRandomPokemon() { // with Async/Await
      try {
        const interval = {
          limit: 1,
          offset: 34
        }
        pokedex.getPokemonsList(interval)
          .then((response) => {
            console.info(response);
            return response;
          })
          .catch((error) => {
            console.log('There was an ERROR: ', error);
          });
          
          
      } catch (error) {
          throw error
      }
  }
    
    async function sendEmbedPokemonMessage(interaction, json) {
      //create and format new embedded message 

	    //get abilities from the json provided
      ability=""
      for (let i=0;i<json.profile.ability.length;i++) {
        if ((i+1) == json.profile.ability.length) {
          ability+=json.profile.ability[i][0]
        } else {
          ability+=json.profile.ability[i][0]+"  `\n`  "
        }
      }
      //get types from the json provided
      type=""
      for (let i=0;i<json.type.length;i++) {
        if ((i+1) == json.type.length) {
          type+=json.type[i]
        } else {
          type+=json.type[i]+"  `\n`  "
        }
      }
      //create and format new embedded message
      const embed = new EmbedBuilder()
        .setColor(FIND_COLOR)
        .setAuthor('Found in the wild!')
        .setTitle(json.name.english)
        .setURL("https://www.pokemon.com/us/pokedex/"+json.name.english)
        .setDescription(json.description)
        .setThumbnail(he.decode(json.hires))
        .addFields(
          {name: "__**Species**__", value: "`  "+json.species+"  `"},
          {name: "__**Type**__", value: "`  "+type+"  `", inline: true},
          {name: "__**Ability**__", value: "`  "+ability+"  `", inline: true},
          {name: "\u200b", value: "\u200b", inline: true},
          {name: "__**HP**__", value: "`  "+json.base.HP+"  `", inline: true},
          {name: "__**Speed**__", value: "`  "+json.base.Speed+"  `", inline: true},
          {name: "\u200b", value: "\u200b", inline: true},
          {name: "__**Attack**__", value: "`  "+json.base.Attack+"  `", inline: true},
                {name: "__**Defense**__", value: "`  "+json.base.Defense+"  `", inline: true},
          {name: "\u200b", value: "\u200b", inline: true},
                {name: "__**Sp. Attack**__", value: "`  "+json.base['Sp. Attack']+"  `", inline: true},
                {name: "__**Sp. Defense**__", value: "`  "+json.base['Sp. Defense']+"  `", inline: true},
          {name: "\u200b", value: "\u200b", inline: true}
        )
        .setFooter("Pokemon data provided by: https://purukitto.github.io/pokemon-api/")
      //send the embedded message
      interaction.reply({ content: "I sent you a photo!", embeds: [embed] });
    }

      //if command is only "@bot find" then:
      if (!args[2]){
        interaction.reply("What should I find?");
        //@bot find pokemon
      } else if (args[2] === 'pokemon'){
        
        //Make an API call for a single random Pokemon
        getRandomPokemon()
        .then(json => JSON.parse(json))
        .then(json => sendEmbedPokemonMessage(interaction, json)); 

      } else if (args[2] === 'cat') {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        msg.channel.send('Random Cat');
        msg.channel.send(file);	  
      }
	 
  },
};