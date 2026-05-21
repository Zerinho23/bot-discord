import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  Collection,
} from "discord.js";
import { logger } from "../lib/logger";
import { registerEvents } from "./events";
import { getCommands } from "./commands";

export let botClient: Client | null = null;

export async function startBot(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    logger.warn("DISCORD_TOKEN or DISCORD_CLIENT_ID not set — bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
    ],
    partials: [Partials.GuildMember, Partials.Channel],
  });

  (client as any).commands = new Collection();

  registerEvents(client);

  await client.login(token);

  const commands = getCommands();
  const rest = new REST().setToken(token);
  try {
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands.map((c) => c.data.toJSON()),
    });
    logger.info("Slash commands registered globally");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
  }

  botClient = client;
  logger.info("Discord bot started");
}
