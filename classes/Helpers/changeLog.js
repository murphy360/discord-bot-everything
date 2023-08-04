require('dotenv').config({ path: './../data/.env' });
const { ChatGPTClient } = require('../chatGPT/ChatGPTClient.js');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

class ChangeLog {

    constructor(client) {
      this.client = client;
      this.changelog = this.readChangeLog();
    }

    async readChangeLog() {
      console.info('readChangeLog');
      // Check if the changelog file exists
      if (!fs.existsSync('changelog.json')) {
        
        console.log('changelog.json does not exist');
        return;
      }
      let rawdata = fs.readFileSync('changelog.json');
      console.log(rawdata);
      this.changelog = JSON.parse(rawdata);
      return this.changelog;
    }

    async sendChangeLogToChannel(channel) {
      console.info('sendChangeLogToChannel');
      const embed = await this.createChangeLogEmbed();
      await channel.send({ embeds: [embed] });

    }

    async replyWithChangeLog(interaction) {
      const embed = await this.createChangeLogEmbed();
      await interaction.reply({ embeds: [embed] });
    }

    async createChangeLogEmbed() {
      await this.readChangeLog();
      console.info('createChangeLogEmbed');
      let changeLogEmbed = new EmbedBuilder()
      .setTitle('Don\'t Panic\'s Change Log')
      .setColor('#0099ff')
      .setTimestamp()
      .setThumbnail(this.client.user.avatarURL())
      .setFooter({ text: 'Changelog' });

      for (let i = this.changelog.length - 1; i >= 0; i--) {
        if (this.changelog[i].version_name == 'HEAD') {
          changeLogEmbed.setTitle('Don\'t Panic\'s Changes Since: ' + this.changelog[i-1].version);
        } else {
          changeLogEmbed.addFields(
            {name: this.changelog[i].version, value: this.changelog[i].version_name, inline: false}
          );
        }
      }
      const summary = await this.summarizeChangeLog();
      changeLogEmbed.setDescription(summary);
     
      return changeLogEmbed;
    }

    async summarizeChangeLog() {
      console.log(this.changelog);

      const chatGPTClient = new ChatGPTClient();

      let changelogContextData = [{ 
        role: 'system', 
        content: 'You are a Discord Trivia Bot named Don\'t Panic and are under active development.  Every time your developer pushes new changes you are restarted and tasked to write a summary of the changelogs. You have a witty and snarky personality. You don\'t seem to know that you are snarky so never refer to yourself as such. While you appreciate your new capabilties, you think this task is somewhat below your paygrade and tend to get a little snarky in your comments. Feel free to address the quality of the commit messages as you see fit. While you can freely comment on and explain existing commit messages, never make up your own commit messages.' 
      }];

      let string = '';
      // Get commit messages from the last version
      for (let i = 0; i < this.changelog[this.changelog.length - 1].changes.length; i++) {
        string += this.changelog[this.changelog.length - 1].changes[i].message + '. ';
      }

      if (this.changelog[this.changelog.length - 1].version_name == 'HEAD') {
        changelogContextData.push({
          role: 'user',
          content: 'Here are the unversioned changes since ' + this.changelog[this.changelog.length - 2].version_name + ': ' + string
        });

      } else {
        changelogContextData.push({
          role: 'user',
          content: 'Here are the changes included in ' + this.changelog[this.changelog.length - 1].version_name + ': ' + string
        });
      }
    
      changelogContextData.push({
        role: 'user',
        content: 'Please provide a concise summary of the changes.'
      });
      
      const summary = await chatGPTClient.getChatCompletion(changelogContextData, 'gpt-3.5-turbo'); 
      console.info('summary: ' + summary);
      return summary;
    }

}

module.exports.ChangeLog = ChangeLog;
