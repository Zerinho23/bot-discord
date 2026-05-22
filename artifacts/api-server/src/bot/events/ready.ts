import { Client } from "discord.js";
import { logger } from "../../lib/logger";
import { db } from "@workspace/db";
import { inviteCodesTable } from "@workspace/db";

export async function onReady(client: Client<true>): Promise<void> {
  logger.info({ tag: client.user?.tag }, "Bot is ready");

  for (const guild of client.guilds.cache.values()) {
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
          .onConflictDoUpdate({
            target: inviteCodesTable.code,
            set: { uses: invite.uses ?? 0 },
          });
      }
    } catch {
      // Guild may not have invite permissions
    }
  }
}
