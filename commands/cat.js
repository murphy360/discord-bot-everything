const fetch = require('node-fetch');
module.exports = {
  name: 'cat',
  description: 'Random Cats',
  async execute(msg, args) {
    //const amount = args[2];
    //const category = args[3];
    //const difficulty = args[4];
    //const type = args[5];

    //const { file } = await fetch('https://opentdb.com/api.php?amount='+amount).then(response => response.json());
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    console.info('Random Cat');
    msg.channel.send('Random Cat');
    msg.channel.send(file);	  
  },
};