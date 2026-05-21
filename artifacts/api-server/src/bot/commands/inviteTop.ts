import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "@workspace/db";
import { inviteStatsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

export const inviteTopCommand = {
  data: new SlashCommandBuilder()
    .setName("invite-top")
    .setDescription("Ver el top de invitaciones del servidor"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;

    const stats = await db
      .select()
      .from(inviteStatsTable)
      .where(eq(inviteStatsTable.guildId, guildId))
      .orderBy(desc(sql`regular_invites - left_invites - fake_invites`))
      .limit(10);

    if (stats.length === 0) {
      await interaction.reply({ content: "No hay datos de invitaciones aún.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Top Invitaciones")
      .setDescription(
        stats
          .map((s, i) => {
            const total = s.regularInvites - s.leftInvites - s.fakeInvites;
            return `**${i + 1}.** <@${s.userId}> — **${total}** invitaciones (${s.regularInvites} total, ${s.leftInvites} se fueron, ${s.fakeInvites} falsas)`;
          })
          .join("\n")
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
