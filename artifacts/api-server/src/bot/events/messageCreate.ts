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
    // Check verification config first — code must be sent in the configured channel
    const [config] = await db
      .select()
      .from(verificationConfigsTable)
      .where(eq(verificationConfigsTable.guildId, guildId));

    if (!config?.enabled || !config.channelId) return;

    // Ignore if the message is not in the verification channel
    if (message.channelId !== config.channelId) return;

    if (!config.roleId) {
      await message.reply({ content: "❌ No hay un rol de verificación configurado. Contacta a un administrador." });
      return;
    }

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

    const member = await message.guild?.members.fetch(userId).catch(() => null);
    if (!member) return;

    // Assign the verified role
    await member.roles.add(config.roleId);

    // Delete the pending verification record
    await db
      .delete(pendingVerificationsTable)
      .where(eq(pendingVerificationsTable.id, pending.id));

    // Delete the code message so the channel stays clean
    await message.delete().catch(() => null);

    // Send a brief success message that auto-deletes after 5 seconds
    const reply = await (message.channel as import("discord.js").TextChannel).send({
      content: `✅ <@${userId}> ¡Has sido verificado exitosamente! Bienvenido al servidor.`,
    });

    setTimeout(() => reply.delete().catch(() => null), 5000);

    logger.info({ guildId, userId }, "User verified via code");
  } catch (err) {
    logger.error({ err }, "Error in messageCreate verification");
  }
}
