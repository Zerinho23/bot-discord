import { Invite } from "discord.js";
import { db } from "@workspace/db";
import { inviteCodesTable } from "@workspace/db";
import { logger } from "../../lib/logger";

export async function onInviteCreate(invite: Invite): Promise<void> {
  if (!invite.guild || !invite.inviter) return;
  try {
    await db
      .insert(inviteCodesTable)
      .values({
        code: invite.code,
        guildId: invite.guild.id,
        inviterId: invite.inviter.id,
        uses: 0,
      })
      .onConflictDoNothing();
  } catch (err) {
    logger.error({ err }, "Error tracking invite create");
  }
}
