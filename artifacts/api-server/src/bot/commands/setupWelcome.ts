import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";

export const setupWelcomeCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-welcome")
    .setDescription("Ver estado del sistema de bienvenida")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: "Configura el sistema de bienvenida desde el dashboard. Los mensajes se envían automáticamente cuando un usuario entra al servidor.",
      ephemeral: true,
    });
  },
};
