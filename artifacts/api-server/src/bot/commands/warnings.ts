import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export const warningsCommand = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Ver las advertencias de un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const guildId = interaction.guildId!;

    const warns = await db
      .select()
      .from(moderationActionsTable)
      .where(and(
        eq(moderationActionsTable.guildId, guildId),
        eq(moderationActionsTable.targetId, target.id),
        eq(moderationActionsTable.type, "warn")
      ));

    if (warns.length === 0) {
      await interaction.reply({ content: `${target.username} no tiene advertencias.`, ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Advertencias de ${target.username}`)
      .setDescription(
        warns
          .slice(0, 10)
          .map((w, i) => `**${i + 1}.** ${w.reason ?? "Sin razón"} — por ${w.moderatorUsername} — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`)
          .join("\n")
      )
      .setFooter({ text: `Total: ${warns.length} advertencias` })
      .setColor(0xffff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
