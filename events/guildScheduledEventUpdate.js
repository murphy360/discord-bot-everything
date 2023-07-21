const { Events } = require('discord.js');
const { Game } = require('./../classes/trivia/game.js');
const { LeaderBoard } = require('./../classes/trivia/leaderBoard.js');

require('dotenv').config({ path: './../data/.env' });

const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

// date string for logging
const LOG_DATE = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  module.exports = {
	name: Events.GuildScheduledEventUpdate,
	async execute(guildOldScheduledEvent, guildNewScheduledEvent) {

		// Summarize the changes
		console.info(LOG_DATE + ": " + guildNewScheduledEvent.name + " Event Update in " + guildNewScheduledEvent.guild.name);

		// guild where the event is happening
		const eventGuild = guildNewScheduledEvent.guild;

		// check what in the event changed
		// if the date changed, log it
		if (guildOldScheduledEvent.date != guildNewScheduledEvent.date) {
			console.info(LOG_DATE + ": Date changed from " + guildOldScheduledEvent.date + " to " + guildNewScheduledEvent.date);
		}
		// if the scheduledStartTimestamp changed, log it
		if (guildOldScheduledEvent.scheduledStartTimestamp != guildNewScheduledEvent.scheduledStartTimestamp) {
			console.info(LOG_DATE + ": scheduledStartTimestamp changed from " + guildOldScheduledEvent.scheduledStartTimestamp + " to " + guildNewScheduledEvent.scheduledStartTimestamp);
		}
		// if the scheduledEndTimestamp changed, log it
		if (guildOldScheduledEvent.scheduledEndTimestamp != guildNewScheduledEvent.scheduledEndTimestamp) {
			console.info(LOG_DATE + ": scheduledEndTimestamp changed from " + guildOldScheduledEvent.scheduledEndTimestamp + " to " + guildNewScheduledEvent.scheduledEndTimestamp);
		}
		// if the privacyLevel changed, log it
		if (guildOldScheduledEvent.privacyLevel != guildNewScheduledEvent.privacyLevel) {
			console.info(LOG_DATE + ": privacyLevel changed from " + guildOldScheduledEvent.privacyLevel + " to " + guildNewScheduledEvent.privacyLevel);
		}
		// if the status changed, log it
		if (guildOldScheduledEvent.status != guildNewScheduledEvent.status) {
			console.info(LOG_DATE + ": status changed from " + guildOldScheduledEvent.status + " to " + guildNewScheduledEvent.status);
		}
		// if the name changed, log it
		if (guildOldScheduledEvent.name != guildNewScheduledEvent.name) {
			console.info(LOG_DATE + ": Name changed from " + guildOldScheduledEvent.name + " to " + guildNewScheduledEvent.name);
		}
		// if the description changed, log it
		if (guildOldScheduledEvent.description != guildNewScheduledEvent.description) {
			console.info(LOG_DATE + ": Description changed from " + guildOldScheduledEvent.description + " to " + guildNewScheduledEvent.description);
		}
		// if the status changed, let's do something
		if (guildOldScheduledEvent.status != guildNewScheduledEvent.status) {
			const client = guildNewScheduledEvent.client;
			const devGuild = client.guilds.cache.get(DEV_GUILD_ID);
			const devChannel = devGuild.channels.cache.find(channel => channel.name === "trivia_bot");
			
			console.info(LOG_DATE + ": Status changed from " + guildOldScheduledEvent.status + " to " + guildNewScheduledEvent.status);
			// if the status changed to SCHEDULED, log it
			if (guildNewScheduledEvent.status == 1) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was scheduled");
				//devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was scheduled");
			}
			// if the status changed to ACTIVE (started), lets start the game if the event is trivia related
			if (guildNewScheduledEvent.status == 2) {

				// if the title doesn't include trivia, don't do anything
				const title = guildNewScheduledEvent.name;
				if (!title.includes('Trivia') && !title.includes('trivia')) {
					console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " started, but is not a trivia event");
					return;
				}

				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was started");
				//devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was started");
			
				// get number of minutes event lasts
				const eventDuration = (guildNewScheduledEvent.scheduledEndTimestamp - guildNewScheduledEvent.scheduledStartTimestamp) / 60000;	
				console.info(LOG_DATE + ": Event Duration: " + eventDuration + " minutes");
				// Each round is about 30 seconds... we want to fill up the event duration with rounds
				
				let rounds = Math.floor(eventDuration * .9);
				if (rounds < 1) {
					rounds = 1;
				} else if (rounds > 45) {
					rounds = 45;
				}

				let difficulty = 'all';
            	let categoryValue = '0';

				// get the category name from the event description
				let categoryName = guildNewScheduledEvent.description;
				// check if the description is not empty
				if (categoryName == '') {
					// Unless defined, make sure we don't have more than 10 questions in any category
					let numCategories = Math.floor(rounds / 10);
					remainder = rounds % 10;
					if (remainder > 0) {
						numCategories++;
					}
					const manager = new QuestionManager(client);
					let categories = [];
					for (let i = 0; i < numCategories; i++) {
						categories.push(await manager.getRandomCategoryFromDataBase());
					}
					categoryName = categories.join(', ');
				}
				
				const game = new Game(guildNewScheduledEvent.client, guildNewScheduledEvent.creator, eventGuild, rounds, difficulty, categoryValue, categoryName);
				await game.init();           
				game_in_progress = true;
				await game.play(120);
				game_in_progress = false;
				await game.end();
				console.info('game ' + game.ID + ' should be over Starting Leaderboard');
				const leaderboard = new LeaderBoard(client);            
				await leaderboard.setWorldTriviaChampionRole();
			}
			// if the status changed to COMPLETED, log it
			if (guildNewScheduledEvent.status == 3) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was completed");
				//devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was completed");
			}
			// if the status changed to CANCELLED, log it
			if (guildNewScheduledEvent.status == 4) {
				console.info(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " was cancelled");
				//devChannel.send(LOG_DATE + ": Event " + guildNewScheduledEvent.name + " in " + eventGuild.name + " was cancelled");
			}
		}


	},
  };