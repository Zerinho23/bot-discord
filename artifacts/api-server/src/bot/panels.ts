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
  import { resolveEmojis } from "../lib/resolveEmojis";

  export async function sendVerificationPanel(guildId: string): Promise<void> {
    if (!botClient) return;

    const [config] = await db
      .select()
      .from(verificationConfigsTable)
      .where(eq(verificationConfigsTable.guildId, guildId));

    const guild = botClient.guilds.cache.get(guildId);

    // If disabled or no channel: delete old panel if it exists, then stop
    if (!config?.enabled || !config.channelId) {
      if (config?.panelMessageId && config.channelId && guild) {
        const ch = guild.channels.cache.get(config.channelId) as TextChannel | undefined;
        if (ch) {
          const old = await ch.messages.fetch(config.panelMessageId).catch(() => null);
          if (old) await old.delete().catch(() => null);
        }
        await db
          .update(verificationConfigsTable)
          .set({ panelMessageId: null })
          .where(eq(verificationConfigsTable.guildId, guildId));
      }
      return;
    }

    if (!guild) return;

    const channel = guild.channels.cache.get(config.channelId) as TextChannel;
    if (!channel) return;

    // Delete old panel message if it exists
    if (config.panelMessageId) {
      const old = await channel.messages.fetch(config.panelMessageId).catch(() => null);
      if (old) await old.delete().catch(() => null);
    }

    const embed = new EmbedBuilder()
      .setTitle(resolveEmojis(config.embedTitle ?? "Verificación", guild))
      .setDescription(resolveEmojis(config.embedDescription ?? "Presiona el botón para verificarte y acceder al servidor.", guild))
      .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

    const button = new ButtonBuilder()
      .setCustomId("verify")
      .setLabel(config.buttonLabel ?? "Verificar")
      .setStyle(ButtonStyle.Primary);

    if (config.buttonEmoji) {
      button.setEmoji(resolveEmojis(config.buttonEmoji, guild));
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const msg = await channel.send({ embeds: [embed], components: [row] });

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

    const guild = botClient.guilds.cache.get(guildId);

    // If disabled or no channel: delete old panel if it exists, then stop
    if (!config?.enabled || !config.channelId) {
      if (config?.panelMessageId && config.channelId && guild) {
        const ch = guild.channels.cache.get(config.channelId) as TextChannel | undefined;
        if (ch) {
          const old = await ch.messages.fetch(config.panelMessageId).catch(() => null);
          if (old) await old.delete().catch(() => null);
        }
        await db
          .update(ticketConfigsTable)
          .set({ panelMessageId: null })
          .where(eq(ticketConfigsTable.guildId, guildId));
      }
      return;
    }

    if (!guild) return;

    const channel = guild.channels.cache.get(config.channelId) as TextChannel;
    if (!channel) return;

    if (config.panelMessageId) {
      const old = await channel.messages.fetch(config.panelMessageId).catch(() => null);
      if (old) await old.delete().catch(() => null);
    }

    const embed = new EmbedBuilder()
      .setTitle(resolveEmojis(config.embedTitle ?? "Sistema de Tickets", guild))
      .setDescription(resolveEmojis(config.embedDescription ?? "Haz clic en el botón para abrir un ticket de soporte.", guild))
      .setColor(parseInt(config.embedColor?.replace("#", "") ?? "5865F2", 16) as any);

    const button = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel(config.buttonLabel ?? "Abrir Ticket")
      .setStyle(ButtonStyle.Primary);

    if (config.buttonEmoji) {
      button.setEmoji(resolveEmojis(config.buttonEmoji, guild));
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const msg = await channel.send({ embeds: [embed], components: [row] });

    await db
      .update(ticketConfigsTable)
      .set({ panelMessageId: msg.id })
      .where(eq(ticketConfigsTable.guildId, guildId));

    logger.info({ guildId, channelId: config.channelId }, "Ticket panel sent/updated");
  }
  