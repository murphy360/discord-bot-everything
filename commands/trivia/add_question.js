const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder }  = require('discord.js');
const { QuestionManager } = require('../../classes/trivia/questionManager.js');
const { Question } = require('../../classes/trivia/question.js');
const { Users } = require('./../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('question')
		.setDescription('Question Management!')
        .addSubcommand(subcommand => 
            subcommand
                .setName('add')
                .setDescription('Add a question')
                .addStringOption(option => 
                    option
                        .setName('question')
                        .setDescription('The question to add')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('answer')
                        .setDescription('The answer to the question')
                        .setRequired(false)
                )
        ),
		
	async execute(interaction) {
		console.info('add_question.js');
		const client = interaction.client;
		const botname = client.user.username;

        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'add') {
            interaction.deferReply();
            const questionManager = new QuestionManager(interaction.client);
            const question = interaction.options.getString('question');
            const answer = interaction.options.getString('answer');
            const source = interaction.user.id;

            let category = "None";
            if (interaction.options.getString('category')) {
                category = interaction.options.getString('category');
            }

            let difficulty = "None"
            if (interaction.options.getString('difficulty')) {
                difficulty = interaction.options.getString('difficulty');
            }

            let incorrect_answers = "None";
            if (interaction.options.getString('incorrect_answers')) {
                incorrect_answers = interaction.options.getString('incorrect_answers');
            }

            const validatedQuestion = await questionManager.factCheckQuestion(question, answer, category, difficulty, incorrect_answers, source);
            validatedQuestion.questionOwnerUserID = interaction.user.id;
            validatedQuestion.questionOwnerGuildID = interaction.guild.id;
            
            const embed = await validatedQuestion.createQuestionEmbed();
            const actionRow = await validatedQuestion.createValidationActionRow();

            let description = "Question Validated!";
            if (question.dislikes > 0) {
                description = "Recommended changes to question.";
            }
            
            await interaction.editReply( { content: description, embeds: [embed], components: [actionRow] } );

            // Create Button Collector
            const timerSecMilli = 30 * 1000; // 30 seconds
            
            // should definitely increase the time in your collector.
            const collector = interaction.channel.createMessageComponentCollector({ time: timerSecMilli });

            collector.on('collect', async i => {
                if (i.customId === 'accept') {
                    await i.update({ content: 'Question Accepted!', components: [] });
                    validatedQuestion.storeQuestion();
                    // Add XP to user who submitted question
                    const user = await Users.findOne({ where: { user_id: validatedQuestion.questionOwnerUserID } });
                    if (user) {
                        await Users.increment({
                            total_xp: 5
                        }, {
                            where: { user_id: validatedQuestion.questionOwnerUserID }
                        });
                    }
                    
                    //await questionManager.addQuestion(validatedQuestion);
                } else if (i.customId === 'reject') {
                    await i.update({ content: 'Question Rejected!', components: [] });
                }
            });

            collector.on('end', async collected => {
                console.log(`Collected ${collected.size} items`);
                // remove buttons
                await interaction.editReply( { content: "Timed Out.", embeds: [embed], components: [] } );
            });
        }




        
        // Function to create an about embed
        // classes/trivia/question.js object
        async function questionEmbed(question) {

            let description = "Question Validated!";
            console.info(question.dislikes + " dislikes");
            if (question.dislikes > 0) {
                description = "Recommended changes to question.";
            }
            
            let questionEmbed = new EmbedBuilder()
                .setTitle('Question Pending Addition')
                .setDescription(description)
                .setFooter( { text: botname } )
                .addFields(
                    { name: 'Question', value: question.question },
                    { name: 'Answer', value: question.answer },
                    { name: 'Category', value: question.category },
                    { name: 'Added By', value: interaction.user.username}, 
                    { name: 'Source', value: question.source },
                    { name: 'Source ID', value: question.sourceID },
                    { name: 'Difficulty', value: question.difficulty },
                    { name: 'Checked By', value: question.sourceUrl}
                )
                .setTimestamp();

                for (let i = 0; i < question.incorrect_choices.length; i++) {
                    questionEmbed.addFields({ name: 'Incorrect Answer', value: question.incorrect_choices[i] });
                }
            return questionEmbed;
        }
	},
};