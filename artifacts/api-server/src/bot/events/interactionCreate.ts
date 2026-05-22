import { Interaction, EmbedBuilder, PermissionFlagsBits, TextChannel, CategoryChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { db } from "@workspace/db";
import {
  verificationConfigsTable,
  ticketConfigsTable,
  ticketsTable,
  pendingVerificationsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { getCommands } from "../commands";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function onInteractionCreate(interaction: Interaction): Promise<void> {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const commands = getCommands();
    const command = commands.find((c) => c.data.name === interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err }, "Error executing command");
      const msg = { content: "Ocurrió un error al ejecutar el comando.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
    return;
  }

  // Button interactions
  if (interaction.isButton()) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    // Verification button — sends code via DM
    if (interaction.customId === "verify") {
      try {
        const [config] = await db
          .select()
          .from(verificationConfigsTable)
          .where(eq(verificationConfigsTable.guildId, guildId));

        if (!config?.enabled || !config.roleId) {
          await interaction.reply({ content: "El sistema de verificación no está configurado.", ephemeral: true });
          return;
        }

        const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
        if (!member) {
          await interaction.reply({ content: "No se pudo encontrar tu perfil.", ephemeral: true });
          return;
        }

        if (member.roles.cache.has(config.roleId)) {
          await interaction.reply({ content: "✅ Ya estás verificado.", ephemeral: true });
          return;
        }

        // Check if there's already a pending verification (avoid spam)
        const existing = await db
          .select()
          .from(pendingVerificationsTable)
          .where(
            and(
              eq(pendingVerificationsTable.guildId, guildId),
              eq(pendingVerificationsTable.userId, interaction.user.id)
            )
          );

        // Delete old pending verifications for this user
        if (existing.length > 0) {
          for (const e of existing) {
            await db.delete(pendingVerificationsTable).where(eq(pendingVerificationsTable.id, e.id));
          }
        }

        // Generate new code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const id = `${guildId}-${interaction.user.id}-${Date.now()}`;

        await db.insert(pendingVerificationsTable).values({
          id,
          guildId,
          userId: interaction.user.id,
          code,
          expiresAt,
        });

        // Send code as ephemeral reply in the verification channel (only visible to the user)
        const codeEmbed = new EmbedBuilder()
          .setTitle("🔐 Tu código de verificación")
          .setDescription(
            `## \`${code}\`\n\n` +
            `Escribe este código **en este canal** para verificarte y acceder al servidor.\n` +
            `⏳ El código expira en **10 minutos**.\n\n` +
            `*Solo tú puedes ver este mensaje.*`
          )
          .setColor(0x5865f2)
          .setTimestamp();

        await interaction.reply({ embeds: [codeEmbed], ephemeral: true });
      } catch (err) {
        logger.error({ err }, "Error in verification button");
        await interaction.reply({ content: "Error al iniciar verificación. Contacta a un administrador.", ephemeral: true });
      }
      return;
    }

    // Ticket open button
    if (interaction.customId === "open_ticket") {
      try {
        const [config] = await db
          .select()
          .from(ticketConfigsTable)
          .where(eq(ticketConfigsTable.guildId, guildId));

        if (!config?.enabled) {
          await interaction.reply({ content: "El sistema de tickets no está activo.", ephemeral: true });
          return;
        }

        // Check if user already has open ticket
        const existing = await db
          .select()
          .from(ticketsTable)
          .where(
            and(
              eq(ticketsTable.guildId, guildId),
              eq(ticketsTable.userId, interaction.user.id),
              eq(ticketsTable.status, "open")
            )
          );

        if (existing.length > 0) {
          await interaction.reply({
            content: `Ya tienes un ticket abierto: <#${existing[0]!.channelId}>`,
            ephemeral: true,
          });
          return;
        }

        const guild = interaction.guild!;
        const ticketName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

        const channelOptions: any = {
          name: ticketName,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
          ],
        };

        if (config.categoryId) channelOptions.parent = config.categoryId;
        if (config.supportRoleId) {
          channelOptions.permissionOverwrites.push({
            id: config.supportRoleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          });
        }

        const channel = await guild.channels.create(channelOptions) as TextChannel;

        await db.insert(ticketsTable).values({
          guildId,
          channelId: channel.id,
          userId: interaction.user.id,
          username: interaction.user.username,
          status: "open",
        });

        const embed = new EmbedBuilder()
          .setTitle("🎫 Ticket de Soporte")
          .setDescription(
            `Hola <@${interaction.user.id}>, el equipo de soporte te atenderá pronto.\n` +
            `Describe tu problema con el mayor detalle posible.\n\n` +
            `Usa el botón de abajo para cerrar el ticket cuando se resuelva.`
          )
          .setColor(0x5865f2)
          .setTimestamp();

        const closeBtn = new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Cerrar Ticket")
          .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder<typeof ButtonBuilder.prototype>().addComponents(closeBtn);

        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

        if (config.logChannelId) {
          const logChannel = guild.channels.cache.get(config.logChannelId) as TextChannel;
          if (logChannel) {
            await logChannel.send(`📩 Nuevo ticket abierto por <@${interaction.user.id}> en <#${channel.id}>`);
          }
        }

        await interaction.reply({ content: `✅ Ticket creado: <#${channel.id}>`, ephemeral: true });
      } catch (err) {
        logger.error({ err }, "Error creating ticket");
        await interaction.reply({ content: "Error al crear el ticket.", ephemeral: true });
      }
      return;
    }

    // Close ticket button
    if (interaction.customId === "close_ticket") {
      try {
        const channelId = interaction.channelId;
        const [ticket] = await db
          .select()
          .from(ticketsTable)
          .where(and(eq(ticketsTable.channelId, channelId), eq(ticketsTable.status, "open")));

        if (!ticket) {
          await interaction.reply({ content: "Este no es un ticket activo.", ephemeral: true });
          return;
        }

        await db
          .update(ticketsTable)
          .set({ status: "closed", closedAt: new Date() })
          .where(eq(ticketsTable.channelId, channelId));

        await interaction.reply({ content: "🔒 Ticket cerrado. El canal será eliminado en 5 segundos." });

        setTimeout(async () => {
          try {
            await interaction.channel?.delete();
          } catch {
            // channel already deleted
          }
        }, 5000);
      } catch (err) {
        logger.error({ err }, "Error closing ticket");
      }
      return;
    }
  }
}
