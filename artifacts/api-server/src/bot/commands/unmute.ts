import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable } from "@workspace/db";

export const unmuteCommand = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Quitar silencio a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption((opt) => opt.setName("razon").setDescription("Razón").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const reason = interaction.options.getString("razon") ?? "Sin razón especificada";
    const guildId = interaction.guildId!;

    const member = interaction.guild?.members.cache.get(target.id);
    if (!member) {
      await interaction.reply({ content: "No se encontró al usuario.", ephemeral: true });
      return;
    }

    await member.timeout(null, reason);

    await db.insert(moderationActionsTable).values({
      guildId,
      type: "unmute",
      targetId: target.id,
      targetUsername: target.username,
      moderatorId: interaction.user.id,
      moderatorUsername: interaction.user.username,
      reason,
    });

    const embed = new EmbedBuilder()
      .setTitle("🔊 Silencio Removido")
      .addFields(
        { name: "Usuario", value: `${target.username} (${target.id})`, inline: true },
        { name: "Moderador", value: interaction.user.username, inline: true },
        { name: "Razón", value: reason }
      )
      .setColor(0x00ff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
