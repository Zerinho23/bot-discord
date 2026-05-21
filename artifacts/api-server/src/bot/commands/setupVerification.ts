import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import { verificationConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const setupVerificationCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-verification")
    .setDescription("Enviar el panel de verificación al canal configurado")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const [config] = await db.select().from(verificationConfigsTable).where(eq(verificationConfigsTable.guildId, guildId));

    if (!config?.enabled || !config.channelId) {
      await interaction.reply({ content: "El sistema de verificación no está configurado. Configúralo desde el dashboard.", ephemeral: true });
      return;
    }

    const channel = interaction.guild?.channels.cache.get(config.channelId) as TextChannel;
    if (!channel) {
      await interaction.reply({ content: "No se encontró el canal de verificación.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(config.embedTitle ?? "Verificación")
      .setDescription(config.embedDescription ?? "Haz clic en el botón para verificarte.")
      .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

    const button = new ButtonBuilder()
      .setCustomId("verify")
      .setLabel(config.buttonLabel ?? "Verificar")
      .setStyle(ButtonStyle.Primary);

    if (config.buttonEmoji) button.setEmoji(config.buttonEmoji);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Panel de verificación enviado a <#${config.channelId}>`, ephemeral: true });
  },
};
