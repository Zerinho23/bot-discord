import { Client } from "discord.js";
import { onReady } from "./ready";
import { onGuildMemberAdd } from "./guildMemberAdd";
import { onInteractionCreate } from "./interactionCreate";
import { onInviteCreate } from "./inviteCreate";
import { onInviteDelete } from "./inviteDelete";
import { onGuildCreate } from "./guildCreate";
import { onMessageCreate } from "./messageCreate";

export function registerEvents(client: Client): void {
  client.once("ready", onReady);
  client.on("guildMemberAdd", onGuildMemberAdd);
  client.on("interactionCreate", onInteractionCreate);
  client.on("inviteCreate", onInviteCreate);
  client.on("inviteDelete", onInviteDelete);
  client.on("guildCreate", onGuildCreate);
  client.on("messageCreate", onMessageCreate);
}
