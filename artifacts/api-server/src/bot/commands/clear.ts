import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from "discord.js";

export const clearCommand = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Eliminar mensajes del canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName("cantidad").setDescription("Cantidad de mensajes a eliminar (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger("cantidad", true);
    const channel = interaction.channel as TextChannel;

    if (!channel) {
      await interaction.reply({ content: "No se pudo obtener el canal.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    const deleted = await channel.bulkDelete(amount, true);
    await interaction.editReply({ content: `✅ Se eliminaron ${deleted.size} mensajes.` });
  },
};
