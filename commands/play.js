module.exports = {
  name: 'play',
  description: 'Play!',
  execute(msg, args) {
    var user = msg.member.displayName;	
    if(!args[1]){
      msg.reply('Hey ' + user + ', you need to tell me what to play');
      return;
    }	 
	
  
    console.log(`Sent a reply to ${user}`);	  
    msg.channel.send('Hello ' + user)
	    .then(() => console.log(`Sent a reply to ${user}`))
	    .catch(console.error);
  }
};
