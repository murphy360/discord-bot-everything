const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'joke',
  description: 'Random Joke',
  async execute(msg, args) {
    fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes', { 
      method: 'GET'})
      .then(response => { return response.json(); })
      .then(json => {
        joke = new Discord.messageEmbed()
          .setAuthor("Joke Bot")
          .setColor("#FF9900")
          .setTitle(json.setup)
      
        msg.channel.send(joke).then(j => { 
          joke.setDescription(json.punchline); 
          setTimeout(function () {j.edit(joke)}, 7000); 
        });
    
                    
    });
  },
};
