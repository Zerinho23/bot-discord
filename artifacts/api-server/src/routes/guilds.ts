import { Router, type IRouter } from "express";
import { ChannelType } from "discord.js";
import { botClient } from "../bot";
import { sendVerificationPanel, sendTicketPanel } from "../bot/panels";
import { db } from "@workspace/db";
import {
  verificationConfigsTable,
  welcomeConfigsTable,
  ticketConfigsTable,
  ticketsTable,
  moderationConfigsTable,
  moderationActionsTable,
  inviteStatsTable,
  inviteConfigsTable,
} from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  GetGuildParams,
  GetGuildStatsParams,
  GetVerificationConfigParams,
  UpdateVerificationConfigParams,
  UpdateVerificationConfigBody,
  GetWelcomeConfigParams,
  UpdateWelcomeConfigParams,
  UpdateWelcomeConfigBody,
  GetTicketConfigParams,
  UpdateTicketConfigParams,
  UpdateTicketConfigBody,
  ListTicketsParams,
  GetModerationConfigParams,
  UpdateModerationConfigParams,
  UpdateModerationConfigBody,
  ListModerationActionsParams,
  ListInviteStatsParams,
  GetInviteConfigParams,
  UpdateInviteConfigParams,
  UpdateInviteConfigBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /guilds
router.get("/guilds", async (req, res): Promise<void> => {
  if (!botClient) {
    res.json([]);
    return;
  }
  const guilds = botClient.guilds.cache.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    memberCount: g.memberCount,
    botPresent: true,
  }));
  res.json(guilds);
});

// GET /guilds/:guildId
router.get("/guilds/:guildId", async (req, res): Promise<void> => {
  const params = GetGuildParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  if (!botClient) { res.status(404).json({ error: "Bot not connected" }); return; }
  const guild = botClient.guilds.cache.get(params.data.guildId);
  if (!guild) { res.status(404).json({ error: "Guild not found" }); return; }

  res.json({ id: guild.id, name: guild.name, icon: guild.icon, memberCount: guild.memberCount, botPresent: true });
});

// GET /guilds/:guildId/channels
router.get("/guilds/:guildId/channels", async (req, res): Promise<void> => {
  const { guildId } = req.params;
  if (!botClient) { res.json([]); return; }
  const guild = botClient.guilds.cache.get(guildId);
  if (!guild) { res.json([]); return; }

  const channels = guild.channels.cache
    .filter((c) =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
    )
    .map((c) => ({ id: c.id, name: c.name, type: c.type }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(channels);
});

// GET /guilds/:guildId/stats
router.get("/guilds/:guildId/stats", async (req, res): Promise<void> => {
  const params = GetGuildStatsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const { guildId } = params.data;

  const guild = botClient?.guilds.cache.get(guildId);

  const [warningCount] = await db.select({ count: count() }).from(moderationActionsTable)
    .where(sql`guild_id = ${guildId} AND type = 'warn'`);
  const [banCount] = await db.select({ count: count() }).from(moderationActionsTable)
    .where(sql`guild_id = ${guildId} AND type = 'ban'`);
  const [ticketCount] = await db.select({ count: count() }).from(ticketsTable)
    .where(eq(ticketsTable.guildId, guildId));
  const [openTicketCount] = await db.select({ count: count() }).from(ticketsTable)
    .where(sql`guild_id = ${guildId} AND status = 'open'`);
  const [inviteCount] = await db.select({ count: count() }).from(inviteStatsTable)
    .where(eq(inviteStatsTable.guildId, guildId));

  const recentActions = await db.select().from(moderationActionsTable)
    .where(eq(moderationActionsTable.guildId, guildId))
    .orderBy(desc(moderationActionsTable.createdAt))
    .limit(5);

  res.json({
    totalMembers: guild?.memberCount ?? 0,
    totalWarnings: warningCount?.count ?? 0,
    totalBans: banCount?.count ?? 0,
    totalTickets: ticketCount?.count ?? 0,
    openTickets: openTicketCount?.count ?? 0,
    totalInvites: inviteCount?.count ?? 0,
    recentActions,
  });
});

// --- VERIFICATION ---
router.get("/guilds/:guildId/verification", async (req, res): Promise<void> => {
  const params = GetVerificationConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [config] = await db.select().from(verificationConfigsTable).where(eq(verificationConfigsTable.guildId, params.data.guildId));
  res.json(config ?? {
    guildId: params.data.guildId,
    enabled: false,
    embedTitle: "🛡️ Verificación de miembros",
    embedDescription: "Para acceder al servidor necesitas verificar que eres humano.\n\nHaz clic en el botón de abajo y sigue las instrucciones. El proceso es rápido y seguro.",
    embedColor: "#57F287",
    buttonLabel: "Verificarme",
    buttonEmoji: "✅",
  });
});

router.patch("/guilds/:guildId/verification", async (req, res): Promise<void> => {
  const params = UpdateVerificationConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateVerificationConfigBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [updated] = await db.insert(verificationConfigsTable)
    .values({ guildId: params.data.guildId, ...body.data, enabled: body.data.enabled ?? false })
    .onConflictDoUpdate({ target: verificationConfigsTable.guildId, set: body.data })
    .returning();
  res.json(updated);
  sendVerificationPanel(params.data.guildId).catch(() => null);
});

// --- WELCOME ---
router.get("/guilds/:guildId/welcome", async (req, res): Promise<void> => {
  const params = GetWelcomeConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [config] = await db.select().from(welcomeConfigsTable).where(eq(welcomeConfigsTable.guildId, params.data.guildId));
  res.json(config ?? {
    guildId: params.data.guildId,
    enabled: false,
    dmEnabled: false,
    embedTitle: "¡Bienvenido/a, {user}!",
    embedDescription: "Nos alegra tenerte en **{server}** 🎉\n\nYa somos **{memberCount}** miembros. Asegúrate de leer las reglas del servidor para disfrutar al máximo.",
    embedColor: "#5865F2",
    embedFooter: "InfernBOT • {server}",
  });
});

router.patch("/guilds/:guildId/welcome", async (req, res): Promise<void> => {
  const params = UpdateWelcomeConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateWelcomeConfigBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [updated] = await db.insert(welcomeConfigsTable)
    .values({ guildId: params.data.guildId, enabled: body.data.enabled ?? false, dmEnabled: body.data.dmEnabled ?? false, ...body.data })
    .onConflictDoUpdate({ target: welcomeConfigsTable.guildId, set: body.data })
    .returning();
  res.json(updated);
});

// POST /guilds/:guildId/welcome/test
router.post("/guilds/:guildId/welcome/test", async (req, res): Promise<void> => {
  const { guildId } = req.params;
  if (!botClient) { res.status(400).json({ ok: false, message: "Bot no conectado" }); return; }

  const [config] = await db.select().from(welcomeConfigsTable).where(eq(welcomeConfigsTable.guildId, guildId));
  if (!config?.channelId) {
    res.status(400).json({ ok: false, message: "No hay canal de bienvenida configurado" });
    return;
  }

  try {
    const guild = botClient.guilds.cache.get(guildId);
    const channel = guild?.channels.cache.get(config.channelId) as import("discord.js").TextChannel | undefined;
    if (!channel) { res.status(400).json({ ok: false, message: "Canal no encontrado" }); return; }

    const { EmbedBuilder } = await import("discord.js");
    const embed = new EmbedBuilder()
      .setColor(parseInt((config.embedColor ?? "#5865F2").replace("#", ""), 16) as any);

    if (config.embedAuthorName) embed.setAuthor({ name: config.embedAuthorName });
    if (config.embedTitle) embed.setTitle(config.embedTitle.replace("{user}", "TestUser").replace("{server}", guild?.name ?? "Servidor").replace("{memberCount}", String(guild?.memberCount ?? 0)));
    if (config.embedDescription) embed.setDescription(config.embedDescription.replace("{user}", "@TestUser").replace("{username}", "TestUser").replace("{server}", guild?.name ?? "Servidor").replace("{memberCount}", String(guild?.memberCount ?? 0)));
    if (config.embedFooter) embed.setFooter({ text: config.embedFooter });
    if (config.embedImage) embed.setImage(config.embedImage);
    if (config.embedThumbnail) embed.setThumbnail(config.embedThumbnail);

    await channel.send({ embeds: [embed] });
    res.json({ ok: true, message: "Embed de prueba enviado correctamente" });
  } catch (err) {
    req.log.error({ err }, "Error sending test welcome embed");
    res.status(500).json({ ok: false, message: "Error al enviar el embed" });
  }
});

// --- TICKETS CONFIG ---
router.get("/guilds/:guildId/tickets/config", async (req, res): Promise<void> => {
  const params = GetTicketConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [config] = await db.select().from(ticketConfigsTable).where(eq(ticketConfigsTable.guildId, params.data.guildId));
  res.json(config ?? {
    guildId: params.data.guildId,
    enabled: false,
    embedTitle: "🎫 Sistema de Tickets",
    embedDescription: "¿Tienes alguna duda, problema o sugerencia?\n\nAbre un ticket y nuestro equipo de soporte te atenderá lo antes posible.",
    embedColor: "#FEE75C",
    buttonLabel: "Abrir Ticket",
    buttonEmoji: "🎫",
  });
});

router.patch("/guilds/:guildId/tickets/config", async (req, res): Promise<void> => {
  const params = UpdateTicketConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateTicketConfigBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [updated] = await db.insert(ticketConfigsTable)
    .values({ guildId: params.data.guildId, enabled: body.data.enabled ?? false, ...body.data })
    .onConflictDoUpdate({ target: ticketConfigsTable.guildId, set: body.data })
    .returning();
  res.json(updated);
  sendTicketPanel(params.data.guildId).catch(() => null);
});

// --- TICKETS LIST ---
router.get("/guilds/:guildId/tickets", async (req, res): Promise<void> => {
  const params = ListTicketsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.guildId, params.data.guildId))
    .orderBy(desc(ticketsTable.createdAt))
    .limit(50);
  res.json(tickets);
});

// --- MODERATION CONFIG ---
router.get("/guilds/:guildId/moderation/config", async (req, res): Promise<void> => {
  const params = GetModerationConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [config] = await db.select().from(moderationConfigsTable).where(eq(moderationConfigsTable.guildId, params.data.guildId));
  res.json(config ?? { guildId: params.data.guildId, enabled: true, autoModEnabled: false, maxWarnings: 3 });
});

router.patch("/guilds/:guildId/moderation/config", async (req, res): Promise<void> => {
  const params = UpdateModerationConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateModerationConfigBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [updated] = await db.insert(moderationConfigsTable)
    .values({ guildId: params.data.guildId, enabled: body.data.enabled ?? true, autoModEnabled: body.data.autoModEnabled ?? false, maxWarnings: body.data.maxWarnings ?? 3, ...body.data })
    .onConflictDoUpdate({ target: moderationConfigsTable.guildId, set: body.data })
    .returning();
  res.json(updated);
});

// --- MODERATION ACTIONS ---
router.get("/guilds/:guildId/moderation/actions", async (req, res): Promise<void> => {
  const params = ListModerationActionsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actions = await db.select().from(moderationActionsTable)
    .where(eq(moderationActionsTable.guildId, params.data.guildId))
    .orderBy(desc(moderationActionsTable.createdAt))
    .limit(100);
  res.json(actions);
});

// --- INVITE STATS ---
router.get("/guilds/:guildId/invites", async (req, res): Promise<void> => {
  const params = ListInviteStatsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const stats = await db.select().from(inviteStatsTable)
    .where(eq(inviteStatsTable.guildId, params.data.guildId))
    .orderBy(desc(sql`regular_invites - left_invites - fake_invites`));
  res.json(stats);
});

// --- INVITE CONFIG ---
router.get("/guilds/:guildId/invites/config", async (req, res): Promise<void> => {
  const params = GetInviteConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [config] = await db.select().from(inviteConfigsTable).where(eq(inviteConfigsTable.guildId, params.data.guildId));
  res.json(config ?? {
    guildId: params.data.guildId,
    enabled: false,
    announceMessage: "¡{user} se ha unido gracias a **{inviter}**! Ya tiene **{invites}** invitaciones. 🎉",
  });
});

router.patch("/guilds/:guildId/invites/config", async (req, res): Promise<void> => {
  const params = UpdateInviteConfigParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateInviteConfigBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [updated] = await db.insert(inviteConfigsTable)
    .values({ guildId: params.data.guildId, enabled: body.data.enabled ?? false, ...body.data })
    .onConflictDoUpdate({ target: inviteConfigsTable.guildId, set: body.data })
    .returning();
  res.json(updated);
});

export default router;
