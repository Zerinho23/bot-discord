import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "@workspace/db";
import {
  welcomeConfigsTable,
  inviteConfigsTable,
  inviteCodesTable,
  inviteStatsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../../lib/logger";

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  const guildId = member.guild.id;

  // Welcome system
  try {
    const [welcomeConfig] = await db
      .select()
      .from(welcomeConfigsTable)
      .where(eq(welcomeConfigsTable.guildId, guildId));

    if (welcomeConfig?.enabled) {
      const description = (welcomeConfig.embedDescription ?? "Welcome to the server!")
        .replace("{user}", `<@${member.id}>`)
        .replace("{username}", member.user.username)
        .replace("{server}", member.guild.name)
        .replace("{memberCount}", String(member.guild.memberCount));

      const embed = new EmbedBuilder()
        .setTitle(welcomeConfig.embedTitle ?? `Welcome to ${member.guild.name}!`)
        .setDescription(description)
        .setColor(parseInt(welcomeConfig.embedColor?.replace("#", "") ?? "5865F2", 16) as any)
        .setThumbnail(member.user.displayAvatarURL());

      if (welcomeConfig.embedFooter) embed.setFooter({ text: welcomeConfig.embedFooter });
      if (welcomeConfig.embedImage) embed.setImage(welcomeConfig.embedImage);

      if (welcomeConfig.channelId) {
        const channel = member.guild.channels.cache.get(welcomeConfig.channelId) as TextChannel;
        if (channel) await channel.send({ embeds: [embed] });
      }

      if (welcomeConfig.dmEnabled && welcomeConfig.dmMessage) {
        try {
          await member.send(welcomeConfig.dmMessage
            .replace("{user}", member.user.username)
            .replace("{server}", member.guild.name));
        } catch {
          // DMs disabled
        }
      }

      if (welcomeConfig.autoRoleId) {
        try {
          await member.roles.add(welcomeConfig.autoRoleId);
        } catch {
          // no perms
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Error in welcome system");
  }

  // Invite tracking
  try {
    const [inviteConfig] = await db
      .select()
      .from(inviteConfigsTable)
      .where(eq(inviteConfigsTable.guildId, guildId));

    if (!inviteConfig?.enabled) return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = await db
      .select()
      .from(inviteCodesTable)
      .where(eq(inviteCodesTable.guildId, guildId));

    let inviterId: string | null = null;
    for (const newInvite of newInvites.values()) {
      const old = oldInvites.find((i) => i.code === newInvite.code);
      if (old && (newInvite.uses ?? 0) > old.uses) {
        inviterId = newInvite.inviter?.id ?? null;
        // Update invite uses
        await db
          .update(inviteCodesTable)
          .set({ uses: newInvite.uses ?? 0 })
          .where(eq(inviteCodesTable.code, newInvite.code));
        break;
      }
    }

    if (inviterId) {
      const inviter = await member.guild.members.fetch(inviterId).catch(() => null);
      const existing = await db
        .select()
        .from(inviteStatsTable)
        .where(and(eq(inviteStatsTable.guildId, guildId), eq(inviteStatsTable.userId, inviterId)));

      if (existing.length > 0) {
        await db
          .update(inviteStatsTable)
          .set({ regularInvites: existing[0]!.regularInvites + 1 })
          .where(and(eq(inviteStatsTable.guildId, guildId), eq(inviteStatsTable.userId, inviterId)));
      } else {
        await db.insert(inviteStatsTable).values({
          guildId,
          userId: inviterId,
          username: inviter?.user.username ?? "Unknown",
          avatar: inviter?.user.avatar,
          regularInvites: 1,
          leftInvites: 0,
          fakeInvites: 0,
        });
      }

      if (inviteConfig.announceChannelId && inviteConfig.announceMessage) {
        const channel = member.guild.channels.cache.get(inviteConfig.announceChannelId) as TextChannel;
        if (channel) {
          await channel.send(
            inviteConfig.announceMessage
              .replace("{user}", `<@${member.id}>`)
              .replace("{inviter}", `<@${inviterId}>`)
              .replace("{server}", member.guild.name)
          );
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Error in invite tracking");
  }
}
