const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        console.info('interactionCreate.js');
		if (!interaction.isChatInputCommand()) {
			console.info(`Command ${interaction.commandName} was found.`);
			return;
		}

		console.info('interactionCreate.js: isChatInputCommand');
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
            console.info('interactionCreate.js: execute');
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};