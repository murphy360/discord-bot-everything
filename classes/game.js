const { EmbedBuilder } = require('discord.js');
const { Question } = require('./question.js');
const { Round } = require('./round.js');
const fetch = require('node-fetch');

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
        //this.questions = this.createQuestions();
        //this.rounds = this.createRounds();
        this.winner = null;
        this.players = new Array();
        this.current_round = 0;
    }
    
    storeGame() {
        const database_id = 0;
        // Store game in database using sequelize
        return database_id;
    }
    
    createQuestions() {
        const file = fetch('https://opentdb.com/api.php?amount='+this.total_rounds).then(response => response.text());
	    let json = JSON.parse(file);
	    
        Qs = new Array()
        for (let i = 0; i < this.total_rounds; i++) {
            Qs[i] = new Question(json.results[i], (i + 1));
        }
        return Qs;
    }
    
    createRounds() {
        Rnds = new Array();
        for (let i = 0; i < this.total_rounds; i++) {
            Rnds[i] = new Round(this.ID, this.questions[i], (i + 1));
        }
        return Rnds;
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
            .setFooter({ text: 'Trivia Game# ' + this.ID, iconURL: this.hostGuild.iconURL() });
            // Send the embed to the trivia channel
            channel.send({ embeds: [embed] });  
        });
    }
    
    start(channel) {
        for (this.current_round = 0; this.current_round < this.total_rounds; this.current_round++) {
            this.rounds[this.current_round].play(channel);
        }
		this.end();
    }

	end() {
		// Display final scoreboard
		this.logGame();
	}
	
	cancel() {
		// Cancel game if requested by user
		this.logGame();
	}
	
    logGame() {
        // post game update of the game data in sequelize database
    }
	
}

module.exports.Game = Game;
