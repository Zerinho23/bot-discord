import { Guild } from "discord.js";
import { logger } from "../../lib/logger";
import { db } from "@workspace/db";
import { inviteCodesTable } from "@workspace/db";

export async function onGuildCreate(guild: Guild): Promise<void> {
  logger.info({ guildId: guild.id, guildName: guild.name }, "Bot joined a new guild");
  try {
    const invites = await guild.invites.fetch();
    for (const invite of invites.values()) {
      if (!invite.inviter) continue;
      await db
        .insert(inviteCodesTable)
        .values({
          code: invite.code,
          guildId: guild.id,
          inviterId: invite.inviter.id,
          uses: invite.uses ?? 0,
        })
        .onConflictDoNothing();
    }
  } catch {
    // no invite perms
  }
}
