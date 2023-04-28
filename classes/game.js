const { EmbedBuilder } = require('discord.js');
const { Question } = require('./question.js');
//const { Round } = require('./round.js');
const fetch = require('node-fetch');
//const { like } = require('sequelize/types/lib/operators.js');

class Game {
     
    constructor(client, hostMember, hostGuild, rounds, difficulty, category) {
        
        this.ID = this.storeGame();
        this.client = client;
		this.hostMember = hostMember;
		this.hostGuild = hostGuild;
        this.total_rounds = rounds;
        this.current_round = 0;
        this.difficulty = difficulty;
        this.category = category;
        this.created_on = Date.now();
        this.winner = null;
        this.players = new Array();
        this.current_round = 0;
    }
    
    storeGame() {
        const database_id = 0;
        // Store game in database using sequelize
        return database_id;
    }
    
    async createQuestions() {
        console.info("createQuestions");
        const file = await fetch('https://opentdb.com/api.php?amount='+this.total_rounds).then(response => response.text());
        const json = JSON.parse(file);
	    console.info('JSON: ' + json);
        this.questions = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            this.questions[i] = new Question(this.client, json.results[i], (i + 1));
            console.info("Question: " + this.questions[i].question);
        }
        return;
    }
    
    /***** INTRO: Display Intro before game *****/
    intro() {
        this.client.guilds.cache.forEach((guild) => {
            const channel = guild.channels.cache.find(
                channel => channel.name.toLowerCase() === "trivia")
            
            const embed = new EmbedBuilder()
            // Set the title of the field
            .setTitle('New Game!')
            // Set the color of the embed
            .setColor(0x0066ff)
            // Set the main content of the embed
            .setDescription('A new game has started!')
            // Add originGuild icon to embedd
            .setThumbnail(this.hostGuild.iconURL())
            .addFields(
                { name: 'Host', value: this.hostMember.displayName, inline: true  },
                { name: 'Host Guild', value: this.hostGuild.name, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Rounds', value: this.total_rounds.toString(), inline: true },
                { name: 'Category', value: this.category, inline: true },
                { name: 'Difficulty', value: this.difficulty, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Trivia Game# ' + this.ID, iconURL: this.client.user.displayAvatarURL() });
            // Send the embed to the trivia channel
            channel.send({ embeds: [embed] });  
        });
    }
    
    async play() {
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            console.info('Round ' + this.current_round + ' starting');
            await this.askQuestionToGuilds(this.questions[this.current_round]);
            console.info('Round ' + this.current_round + ' complete');
        }
        
        this.end();
        return;
    }

    // Ask a question to all guilds, returns once the question has been answered from each
    async askQuestionToGuilds(question) {


        return new Promise((resolve, reject) => {
            console.info('Inside Promise');
            const guilds = this.client.guilds.cache;
            const promises = [];
            // print guild names
            guilds.forEach((guild) => {
                console.info('Sending Question to Guild: ' + guild.name);
                const channel = guild.channels.cache.find(
                    channel => channel.name.toLowerCase() === "trivia");
                
                promises.push(question.ask(channel)); 
                console.info('There are ' + promises.length + ' promises'); 
            });
            
            console.info('Waiting for all promises to resolve');
            Promise.all(promises); 
            console.info('All promises resolved');
        });
    }

	end() {
		// Display final scoreboard
        console.info('Game Over');
		this.logGame();
	}
	
	cancel() {
		// Cancel game if requested by user
		this.logGame();
	}
	
    logGame() {
        console.info("Log Game " + this.ID);
        // post game update of the game data in sequelize database
    }
	
}

module.exports.Game = Game;
