//requirements for youtube interaction (download and Search)
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
  
  name: 'play',

  description: 'Joins a users voice channel, searches for and plays a video from youtube',
  
  async execute(message, args) {

    //Users Voice Channel	  
    const voiceChannel = message.member.voice.channel;

    //Need to piggyback on users voice channel... TODO drag user into default channel if needed
    if(!voiceChannel) return message.channel.send('you need to be in a voice channel to execute this command!');

    //Make sure we have the right permissions to play some music	  
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissions');
    if(!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissions');

    //make sure theres data to work with 0 bot name 1 command 2 search phrase	  
    if(!args[2]) return message.channel.send('What would you like to play? I need a second argument.');


    const connection = await voiceChannel.join();

    const videoFinder = async (query) => {
	const videoResult = await ytSearch(query);
	return(videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }

    const video = await videoFinder(args.join(' '));

    if(video){
	const stream = ytdl(video.url, {filter: 'audioonly'});
	connection.play(stream, {seek:0, volume: 1})
	    .on('finish', () =>{
		voiceChannel.leave();
		message.channel.send('Peace Out!');
	    });
  	await message.reply(`:thumbsup: Now Playing ***${video.title}***`)

    }else{
	message.channel.send('No Video Found');

    }
  }

}
