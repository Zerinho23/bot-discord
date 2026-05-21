import { Router, type IRouter, type Request } from "express";
import { logger } from "../lib/logger";
import { botClient } from "../bot";

const router: IRouter = Router();

function getRedirectUri(req: Request): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/callback`;
  return `https://${req.get("host")}/api/auth/callback`;
}

router.get("/auth/discord", async (req, res): Promise<void> => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = getRedirectUri(req);
  const scopes = ["identify", "guilds"].join("%20");
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;
  res.redirect(url);
});

router.get("/auth/callback", async (req, res): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }

  try {
    const redirectUri = getRedirectUri(req);
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? "",
      client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json() as any;
    if (!tokenData.access_token) {
      logger.error({ tokenData }, "Failed to get access token");
      res.redirect("/?error=auth_failed");
      return;
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json() as any;

    (req.session as any).discordUser = userData;
    (req.session as any).accessToken = tokenData.access_token;

    res.redirect("/servers");
  } catch (err) {
    logger.error({ err }, "OAuth callback error");
    res.redirect("/?error=auth_failed");
  }
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = (req.session as any)?.discordUser;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const guilds: any[] = [];
  if (botClient) {
    for (const guild of botClient.guilds.cache.values()) {
      guilds.push({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: guild.memberCount,
        botPresent: true,
      });
    }
  }

  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    guilds,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

export default router;
