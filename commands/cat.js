const fetch = require('node-fetch');
module.exports = {
  name: 'cat',
  description: 'Random Cats',
  async execute(msg, args) {
   
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    console.info('Random Cat');
    msg.channel.send('Random Cat');
    msg.channel.send(file);	  
  },
};
