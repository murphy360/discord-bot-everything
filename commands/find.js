const fetch = require('node-fetch');
const { json } = require('sequelize');
module.exports = {
  name: 'find',
  description: 'Finds things',
  async execute(msg, args) {

    if (!args[2]){
      msg.channel.send("What should I find?");
    }
    
  },
};