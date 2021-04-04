module.exports = {
  name: 'play',
  description: 'Play!',
  execute(msg, args) {
    if(!args[1]){
      msg.reply('Hey ' + user + ', you need to tell me what to play');
      return;
    }	 
	
    var user = msg.member.displayName;	  
    console.log(`Sent a reply to ${user}`);	  
    msg.channel.send('Hello ' + user)
	    .then(() => console.log(`Sent a reply to ${user}`))
	    .catch(console.error);
  }
};
