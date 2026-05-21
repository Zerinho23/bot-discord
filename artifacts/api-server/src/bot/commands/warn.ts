import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable, moderationConfigsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

export const warnCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advertir a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a advertir").setRequired(true))
    .addStringOption((opt) => opt.setName("razon").setDescription("Razón de la advertencia").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const reason = interaction.options.getString("razon", true);
    const guildId = interaction.guildId!;

    await db.insert(moderationActionsTable).values({
      guildId,
      type: "warn",
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
    });

    const [warnCount] = await db
      .select({ count: count() })
      .from(moderationActionsTable)
      .where(and(
        eq(moderationActionsTable.guildId, guildId),
        eq(moderationActionsTable.userId, target.id),
        eq(moderationActionsTable.type, "warn")
      ));

    const totalWarnings = warnCount?.count ?? 0;

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Advertencia Emitida")
      .addFields(
        { name: "Usuario", value: `${target.username} (${target.id})`, inline: true },
        { name: "Moderador", value: interaction.user.username, inline: true },
        { name: "Total de advertencias", value: String(totalWarnings), inline: true },
        { name: "Razón", value: reason }
      )
      .setColor(0xffff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      await target.send(`⚠️ Has recibido una advertencia en **${interaction.guild?.name}**.\nRazón: ${reason}`);
    } catch {
      // DMs disabled
    }

    const [config] = await db.select().from(moderationConfigsTable).where(eq(moderationConfigsTable.guildId, guildId));
    if (config?.logChannelId) {
      const ch = interaction.guild?.channels.cache.get(config.logChannelId) as TextChannel;
      if (ch) await ch.send({ embeds: [embed] });
    }
  },
};
