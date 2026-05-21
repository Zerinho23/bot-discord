import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import { ticketConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const setupTicketsCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Enviar el panel de tickets al canal configurado")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const [config] = await db.select().from(ticketConfigsTable).where(eq(ticketConfigsTable.guildId, guildId));

    if (!config?.enabled || !config.channelId) {
      await interaction.reply({ content: "El sistema de tickets no está configurado. Configúralo desde el dashboard.", ephemeral: true });
      return;
    }

    const channel = interaction.guild?.channels.cache.get(config.channelId) as TextChannel;
    if (!channel) {
      await interaction.reply({ content: "No se encontró el canal de tickets.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(config.embedTitle ?? "Sistema de Tickets")
      .setDescription(config.embedDescription ?? "Haz clic en el botón para abrir un ticket de soporte.")
      .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

    const button = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel(config.buttonLabel ?? "Abrir Ticket")
      .setStyle(ButtonStyle.Primary);

    if (config.buttonEmoji) button.setEmoji(config.buttonEmoji);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Panel de tickets enviado a <#${config.channelId}>`, ephemeral: true });
  },
};
