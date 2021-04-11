const fetch = require('node-fetch');
module.exports = {
  name: 'jokes',
  description: 'Random Jokes',
  async execute(msg, args) {

    const { file } = await fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes').then(response => response.json().catch((error) => {
      console.info(error);
      done();
    }));
    console.info('Random Joke: ' + file);
    msg.channel.send('Random Joke');
    msg.channel.send(file);	  
  },
};
