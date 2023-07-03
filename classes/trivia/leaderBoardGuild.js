const { EmbedBuilder }  = require('discord.js');
const { Users, Answers } = require('../../dbObjects.js');
const { Sequelize, Op } = require('sequelize');
require('dotenv').config({ path: './../data/.env' });
const TRIVIA_CHANNEL = process.env.TRIVIA_CHANNEL;

//This class sends the game introduction
class LeaderBoardGuild {
   
    constructor(client) {
        this.client = client;
        this.tiedChamps = null; 
        this.highestScorers = null;
        this.highestScore = null;
        this.guild = null;
        this.guildTriviaChampion = null;    // The user with the highest trivia_points_total (DBObject) in this guild
        console.info('LeaderBoard constructor ' + this.client.user.username);
        
    }

    // Find the world champion
    async findGuildHighScores(guild) {
        this.guild = guild;
        console.info('findGuildHighScores');
        this.highestScorers = await Answers.findAll({
            attributes: [
              'user_id',
              [Sequelize.fn('sum', Sequelize.col('points')), 'total_points'],
            ],
            where: {
              guild_id: guild.id,
            },
            group: ['user_id'],
            order: [[Sequelize.fn('sum', Sequelize.col('points')), 'DESC']],
            limit: 10,
          });

        
        if (this.highestScorers.length === 1) {
            console.info('Highest Score: ' + this.highestScorers[0].dataValues.total_points);
            this.guildTriviaChampion = await this.client.users.cache.get(this.highestScorers[0].dataValues.user_id);
        } else if (this.highestScorers.length > 1) {
            console.info('More than one score found');
            
            if (this.highestScorers[0].dataValues.total_points === this.highestScorers[1].dataValues.total_points) {
                console.info('Tie for top score - Currently Unhandled'); // TODO Handle ties for top score
                // TODO Figure our ties
            } else {
                console.info('No tie for top score');
            }
            this.guildTriviaChampion = await this.client.users.cache.get(this.highestScorers[0].dataValues.user_id);
        } else {

            console.info('No scores found');
        }

        if (this.highestScorers.length > 0) {
            console.log(this.highestScorers);
            console.log(this.highestScorers[0]);
            console.log(this.highestScorers[0].dataValues);
            console.log("THIS MAY BE IT:");
            console.log(this.highestScorers[0].dataValues.user_id);
            this.highestScore = this.highestScorers[0].total_points;
            console.log('Guild Trivia Champion: ' + this.guildTriviaChampion.username + ' with ' + this.highestScorers[0].dataValues.total_points + ' points');
        
        }
    }

    async getWorldTopScoresString() {

    }

    async findGuildChampion(guild) {

    }

    async postManualGuildLeaderBoard(interaction) {
        console.info('postManualGuildLeaderBoard');
        await this.findGuildHighScores(interaction.guild);
        let embed = await this.getGuildLeaderBoardEmbed();
        interaction.reply({ embeds: [embed] }); 
    }

    async getGuildLeaderBoardEmbed() {
        
        return new Promise(async (resolve, reject) => {
            
            let leaderNameString = "";
            let leaderScoreString = "";

            const embed = new EmbedBuilder()
            .setTitle(this.guild.name + ' Trivia LeaderBoard!')
            .setColor(0x0066ff)
            .setThumbnail(this.guild.iconURL())

            if (this.highestScorers.length === 0) {
                console.info('No scores found');
                embed.setDescription('There\'s no scores yet!')
                embed.setTimestamp()
                resolve(embed);
            } else if (this.highestScorers.length === 1) {
                console.info('Only one score found');
                const guildChampScore = this.highestScorers[0].dataValues.total_points;
                embed.setDescription('Playing by yourself?')
                embed.addFields(
                    { name: 'The Only Player', value: this.guildTriviaChampion.username, inline: true  },
                    { name: 'Trivia Score', value: guildChampScore.toString(), inline: true  },
                )
                embed.setTimestamp()
                
            } else {
                // Build the strings for the embed
                for (let i = 1; i < this.highestScorers.length; i++) {
                    const user = await this.client.users.cache.get(this.highestScorers[i].dataValues.user_id);
                    if (user) {
                        leaderNameString += user.username + '\n';
                        leaderScoreString += this.highestScorers[i].dataValues.total_points + '\n';
                    } else {
                        leaderNameString += this.highestScorers[i].dataValues.user_id + '\n';
                        leaderScoreString += this.highestScorers[i].dataValues.total_points + '\n';
                    }  
                }

                console.info('Guild Champion: ' + this.guildTriviaChampion.username);
                const guildChampScore = this.highestScorers[0].dataValues.total_points;
                console.info('Guild Champ Score: ' + this.highestScorers[0].dataValues.total_points);
                console.info('leaderNameString: ' + leaderNameString);
                console.info('leaderScoreString: ' + leaderScoreString);
                embed.setDescription('Guild Trivia Champion!')
                            // Add originGuild icon to embedd
                
                embed.addFields(
                    { name: 'Reigning Champion', value: this.guildTriviaChampion.username, inline: true  },
                    { name: 'Trivia Score', value: guildChampScore.toString(), inline: true  },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'High Scores:', value: leaderNameString, inline: true },
                    { name: 'Trivia Scores:', value: leaderScoreString, inline: true }             
                )
                embed.setTimestamp()
  
            }
            resolve(embed);
        });
    }


}
  
module.exports.LeaderBoardGuild = LeaderBoardGuild;