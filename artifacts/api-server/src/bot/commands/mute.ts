import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable, moderationConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const muteCommand = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silenciar a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a silenciar").setRequired(true))
    .addStringOption((opt) => opt.setName("duracion").setDescription("Duración (ej: 10m, 1h, 1d)").setRequired(false))
    .addStringOption((opt) => opt.setName("razon").setDescription("Razón").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const duration = interaction.options.getString("duracion") ?? "10m";
    const reason = interaction.options.getString("razon") ?? "Sin razón especificada";
    const guildId = interaction.guildId!;

    const member = interaction.guild?.members.cache.get(target.id);
    if (!member) {
      await interaction.reply({ content: "No se encontró al usuario.", ephemeral: true });
      return;
    }

    const ms = parseDuration(duration);
    if (!ms) {
      await interaction.reply({ content: "Duración inválida. Usa formato: 10m, 1h, 1d", ephemeral: true });
      return;
    }

    await member.timeout(ms, reason);

    await db.insert(moderationActionsTable).values({
      guildId,
      type: "mute",
      targetId: target.id,
      targetUsername: target.username,
      moderatorId: interaction.user.id,
      moderatorUsername: interaction.user.username,
      reason,
      duration,
    });

    const embed = new EmbedBuilder()
      .setTitle("🔇 Usuario Silenciado")
      .addFields(
        { name: "Usuario", value: `${target.username} (${target.id})`, inline: true },
        { name: "Duración", value: duration, inline: true },
        { name: "Moderador", value: interaction.user.username, inline: true },
        { name: "Razón", value: reason }
      )
      .setColor(0xffa500)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const [config] = await db.select().from(moderationConfigsTable).where(eq(moderationConfigsTable.guildId, guildId));
    if (config?.logChannelId) {
      const ch = interaction.guild?.channels.cache.get(config.logChannelId) as TextChannel;
      if (ch) await ch.send({ embeds: [embed] });
    }
  },
};

function parseDuration(str: string): number | null {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const val = parseInt(match[1]!);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * (multipliers[unit!] ?? 0);
}
