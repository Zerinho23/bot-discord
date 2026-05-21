import { Invite } from "discord.js";
import { db } from "@workspace/db";
import { inviteCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger";

export async function onInviteDelete(invite: Invite): Promise<void> {
  try {
    await db.delete(inviteCodesTable).where(eq(inviteCodesTable.code, invite.code));
  } catch (err) {
    logger.error({ err }, "Error tracking invite delete");
  }
}
