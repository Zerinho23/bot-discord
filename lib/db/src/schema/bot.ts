import {
  pgTable,
  text,
  boolean,
  integer,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const verificationConfigsTable = pgTable("verification_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  roleId: text("role_id"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  buttonLabel: text("button_label"),
  buttonEmoji: text("button_emoji"),
  panelMessageId: text("panel_message_id"),
});

export const welcomeConfigsTable = pgTable("welcome_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  dmEnabled: boolean("dm_enabled").notNull().default(false),
  channelId: text("channel_id"),
  embedAuthorName: text("embed_author_name"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  embedFooter: text("embed_footer"),
  embedImage: text("embed_image"),
  embedThumbnail: text("embed_thumbnail"),
  dmMessage: text("dm_message"),
  autoRoleId: text("auto_role_id"),
});

export const ticketConfigsTable = pgTable("ticket_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  categoryId: text("category_id"),
  staffRoleId: text("staff_role_id"),
  supportRoleId: text("support_role_id"),
  logChannelId: text("log_channel_id"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  buttonLabel: text("button_label"),
  buttonEmoji: text("button_emoji"),
  panelMessageId: text("panel_message_id"),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username").notNull().default(""),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const moderationConfigsTable = pgTable("moderation_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  autoModEnabled: boolean("auto_mod_enabled").notNull().default(false),
  maxWarnings: integer("max_warnings").notNull().default(3),
  logChannelId: text("log_channel_id"),
  muteRoleId: text("mute_role_id"),
});

export const moderationActionsTable = pgTable("moderation_actions", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  moderatorId: text("moderator_id").notNull(),
  type: text("type").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inviteStatsTable = pgTable("invite_stats", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username").notNull().default(""),
  avatar: text("avatar"),
  regularInvites: integer("regular_invites").notNull().default(0),
  leftInvites: integer("left_invites").notNull().default(0),
  fakeInvites: integer("fake_invites").notNull().default(0),
  bonusInvites: integer("bonus_invites").notNull().default(0),
});

export const inviteConfigsTable = pgTable("invite_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  announceChannelId: text("announce_channel_id"),
  announceMessage: text("announce_message"),
});

export const inviteCodesTable = pgTable("invite_codes", {
  code: text("code").primaryKey(),
  guildId: text("guild_id").notNull(),
  inviterId: text("inviter_id"),
  uses: integer("uses").notNull().default(0),
});

export const pendingVerificationsTable = pgTable("pending_verifications", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
