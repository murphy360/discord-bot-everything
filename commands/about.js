module.exports = {
  name: 'about',
  description: 'About!',
  execute(msg, args) {
    msg.reply('About!');
    msg.channel.send('This bot was written by Christian Acord and Corey Murphy.  It was originally forked from sitepoint-editors/discord-bot-sitepoint.  Current iteration supports basic sing-word commands such as ping and about. Feel free to contribute https://github.com/murphy360/discord-bot-everything');
  },
};
