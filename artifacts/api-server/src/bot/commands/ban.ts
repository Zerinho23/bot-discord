import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable, moderationConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";

export const banCommand = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banear a un usuario del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true))
    .addStringOption((opt) => opt.setName("razon").setDescription("Razón del ban").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const reason = interaction.options.getString("razon") ?? "Sin razón especificada";
    const guildId = interaction.guildId!;

    const member = interaction.guild?.members.cache.get(target.id);
    if (!member) {
      await interaction.reply({ content: "No se encontró al usuario.", ephemeral: true });
      return;
    }

    if (!member.bannable) {
      await interaction.reply({ content: "No puedo banear a este usuario.", ephemeral: true });
      return;
    }

    await member.ban({ reason });

    await db.insert(moderationActionsTable).values({
      guildId,
      type: "ban",
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
    });

    const embed = new EmbedBuilder()
      .setTitle("🔨 Usuario Baneado")
      .addFields(
        { name: "Usuario", value: `${target.username} (${target.id})`, inline: true },
        { name: "Moderador", value: interaction.user.username, inline: true },
        { name: "Razón", value: reason }
      )
      .setColor(0xff0000)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const [config] = await db.select().from(moderationConfigsTable).where(eq(moderationConfigsTable.guildId, guildId));
    if (config?.logChannelId) {
      const logChannel = interaction.guild?.channels.cache.get(config.logChannelId) as TextChannel;
      if (logChannel) await logChannel.send({ embeds: [embed] });
    }
  },
};
