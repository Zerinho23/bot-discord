import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { db } from "@workspace/db";
import { verificationConfigsTable, ticketConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { botClient } from "./index";

export async function sendVerificationPanel(guildId: string): Promise<void> {
  if (!botClient) return;

  const [config] = await db
    .select()
    .from(verificationConfigsTable)
    .where(eq(verificationConfigsTable.guildId, guildId));

  if (!config?.enabled || !config.channelId) return;

  const guild = botClient.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(config.channelId) as TextChannel;
  if (!channel) return;

  // Delete old panel message if it exists
  if (config.panelMessageId) {
    try {
      const old = await channel.messages.fetch(config.panelMessageId).catch(() => null);
      if (old) await old.delete();
    } catch {
      // message already deleted or not found
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(config.embedTitle ?? "Verificación")
    .setDescription(config.embedDescription ?? "Presiona el botón para verificarte y acceder al servidor.")
    .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

  const button = new ButtonBuilder()
    .setCustomId("verify")
    .setLabel(config.buttonLabel ?? "Verificar")
    .setStyle(ButtonStyle.Primary);

  if (config.buttonEmoji) button.setEmoji(config.buttonEmoji);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  const msg = await channel.send({ embeds: [embed], components: [row] });

  // Save the new message ID
  await db
    .update(verificationConfigsTable)
    .set({ panelMessageId: msg.id })
    .where(eq(verificationConfigsTable.guildId, guildId));

  logger.info({ guildId, channelId: config.channelId }, "Verification panel sent/updated");
}

export async function sendTicketPanel(guildId: string): Promise<void> {
  if (!botClient) return;

  const [config] = await db
    .select()
    .from(ticketConfigsTable)
    .where(eq(ticketConfigsTable.guildId, guildId));

  if (!config?.enabled || !config.channelId) return;

  const guild = botClient.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(config.channelId) as TextChannel;
  if (!channel) return;

  // Delete old panel message if it exists
  if (config.panelMessageId) {
    try {
      const old = await channel.messages.fetch(config.panelMessageId).catch(() => null);
      if (old) await old.delete();
    } catch {
      // message already deleted
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(config.embedTitle ?? "Sistema de Tickets")
    .setDescription(config.embedDescription ?? "Haz clic en el botón para abrir un ticket de soporte.")
    .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

  const button = new ButtonBuilder()
    .setCustomId("open_ticket")
    .setLabel(config.buttonLabel ?? "Abrir Ticket")
    .setStyle(ButtonStyle.Primary);

  if (config.buttonEmoji) button.setEmoji(config.buttonEmoji);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  const msg = await channel.send({ embeds: [embed], components: [row] });

  // Save the new message ID
  await db
    .update(ticketConfigsTable)
    .set({ panelMessageId: msg.id })
    .where(eq(ticketConfigsTable.guildId, guildId));

  logger.info({ guildId, channelId: config.channelId }, "Ticket panel sent/updated");
}
