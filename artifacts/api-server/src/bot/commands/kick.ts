import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import { moderationActionsTable, moderationConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const kickCommand = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsar a un usuario del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) => opt.setName("usuario").setDescription("Usuario a expulsar").setRequired(true))
    .addStringOption((opt) => opt.setName("razon").setDescription("Razón").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("usuario", true);
    const reason = interaction.options.getString("razon") ?? "Sin razón especificada";
    const guildId = interaction.guildId!;

    const member = interaction.guild?.members.cache.get(target.id);
    if (!member?.kickable) {
      await interaction.reply({ content: "No puedo expulsar a este usuario.", ephemeral: true });
      return;
    }

    await member.kick(reason);

    await db.insert(moderationActionsTable).values({
      guildId,
      type: "kick",
      targetId: target.id,
      targetUsername: target.username,
      moderatorId: interaction.user.id,
      moderatorUsername: interaction.user.username,
      reason,
    });

    const embed = new EmbedBuilder()
      .setTitle("👢 Usuario Expulsado")
      .addFields(
        { name: "Usuario", value: `${target.username} (${target.id})`, inline: true },
        { name: "Moderador", value: interaction.user.username, inline: true },
        { name: "Razón", value: reason }
      )
      .setColor(0xff6600)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const [config] = await db.select().from(moderationConfigsTable).where(eq(moderationConfigsTable.guildId, guildId));
    if (config?.logChannelId) {
      const ch = interaction.guild?.channels.cache.get(config.logChannelId) as TextChannel;
      if (ch) await ch.send({ embeds: [embed] });
    }
  },
};
