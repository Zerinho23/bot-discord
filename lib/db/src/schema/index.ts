import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const verificationConfigsTable = pgTable("verification_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  roleId: text("role_id"),
  message: text("message"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  buttonLabel: text("button_label"),
  buttonEmoji: text("button_emoji"),
  panelMessageId: text("panel_message_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pendingVerificationsTable = pgTable("pending_verifications", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const welcomeConfigsTable = pgTable("welcome_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  message: text("message"),
  dmEnabled: boolean("dm_enabled").notNull().default(false),
  dmMessage: text("dm_message"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  embedFooter: text("embed_footer"),
  embedImage: text("embed_image"),
  embedThumbnail: text("embed_thumbnail"),
  embedAuthorName: text("embed_author_name"),
  autoRoleId: text("auto_role_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketConfigsTable = pgTable("ticket_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  categoryId: text("category_id"),
  staffRoleId: text("staff_role_id"),
  supportRoleId: text("support_role_id"),
  logChannelId: text("log_channel_id"),
  message: text("message"),
  embedTitle: text("embed_title"),
  embedDescription: text("embed_description"),
  embedColor: text("embed_color"),
  buttonLabel: text("button_label"),
  buttonEmoji: text("button_emoji"),
  panelMessageId: text("panel_message_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const moderationConfigsTable = pgTable("moderation_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  logChannelId: text("log_channel_id"),
  muteRoleId: text("mute_role_id"),
  autoModEnabled: boolean("auto_mod_enabled").notNull().default(false),
  maxWarnings: integer("max_warnings").notNull().default(3),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moderationActionsTable = pgTable("moderation_actions", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  moderatorId: text("moderator_id").notNull(),
  type: text("type").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inviteCodesTable = pgTable("invite_codes", {
  code: text("code").primaryKey(),
  guildId: text("guild_id").notNull(),
  inviterId: text("inviter_id").notNull(),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inviteStatsTable = pgTable("invite_stats", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username"),
  avatar: text("avatar"),
  inviterId: text("inviter_id"),
  regularInvites: integer("regular_invites").notNull().default(0),
  leftInvites: integer("left_invites").notNull().default(0),
  fakeInvites: integer("fake_invites").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inviteConfigsTable = pgTable("invite_configs", {
  guildId: text("guild_id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  channelId: text("channel_id"),
  announceChannelId: text("announce_channel_id"),
  announceMessage: text("announce_message"),
  message: text("message"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
