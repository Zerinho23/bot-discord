import { Message } from "discord.js";
import { db } from "@workspace/db";
import { pendingVerificationsTable, verificationConfigsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "../../lib/logger";

export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.guildId) return;

  const guildId = message.guildId;
  const userId = message.author.id;
  const content = message.content.trim().toUpperCase();

  // Only process messages that look like verification codes (6 alphanumeric chars)
  if (!/^[A-Z0-9]{6}$/.test(content)) return;

  try {
    const now = new Date();
    const [pending] = await db
      .select()
      .from(pendingVerificationsTable)
      .where(
        and(
          eq(pendingVerificationsTable.guildId, guildId),
          eq(pendingVerificationsTable.userId, userId),
          eq(pendingVerificationsTable.code, content),
          gt(pendingVerificationsTable.expiresAt, now)
        )
      );

    if (!pending) return;

    // Get the configured role
    const [config] = await db
      .select()
      .from(verificationConfigsTable)
      .where(eq(verificationConfigsTable.guildId, guildId));

    if (!config?.roleId) {
      await message.reply({ content: "❌ No hay un rol de verificación configurado. Contacta a un administrador." });
      return;
    }

    const member = await message.guild?.members.fetch(userId).catch(() => null);
    if (!member) return;

    // Assign the member role
    await member.roles.add(config.roleId);

    // Delete the pending verification
    await db
      .delete(pendingVerificationsTable)
      .where(eq(pendingVerificationsTable.id, pending.id));

    // Delete the code message for security
    await message.delete().catch(() => null);

    // Send confirmation (ephemeral-style: auto-delete after 5s)
    const reply = await (message.channel as import("discord.js").TextChannel).send({
      content: `✅ <@${userId}> ¡Has sido verificado exitosamente! Bienvenido al servidor.`,
    });

    setTimeout(() => reply.delete().catch(() => null), 5000);

    logger.info({ guildId, userId }, "User verified via code");
  } catch (err) {
    logger.error({ err }, "Error in messageCreate verification");
  }
}
