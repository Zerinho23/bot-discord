import { useListGuilds, getListGuildsQueryKey } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Settings, Users, RefreshCw, Zap, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Servers() {
  const { data: guilds, isLoading, refetch, isFetching } = useListGuilds({
    query: { queryKey: getListGuildsQueryKey() }
  });

  const botGuilds = guilds?.filter(g => g.botPresent) ?? [];
  const otherGuilds = guilds?.filter(g => !g.botPresent) ?? [];

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Mis Servidores</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecciona un servidor para configurar InfernBOT
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[152px] rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Servers WITH bot */}
            {botGuilds.length > 0 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.4)]" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    InfernBOT activo — {botGuilds.length} servidor{botGuilds.length !== 1 ? "es" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {botGuilds.map((guild, i) => (
                    <GuildCard key={guild.id} guild={guild} style={{ animationDelay: `${i * 60}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Servers WITHOUT bot */}
            {otherGuilds.length > 0 && (
              <div className="space-y-4 animate-fade-in-up-delay-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Sin bot — {otherGuilds.length} servidor{otherGuilds.length !== 1 ? "es" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherGuilds.map((guild, i) => (
                    <GuildCard key={guild.id} guild={guild} style={{ animationDelay: `${i * 60}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {guilds?.length === 0 && (
              <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-white/[0.01]">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border">
                  <Zap className="w-7 h-7 text-muted-foreground opacity-40" />
                </div>
                <h3 className="text-base font-bold">Sin servidores</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                  No eres administrador en ningún servidor de Discord.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

function GuildCard({
  guild,
  style,
}: {
  guild: { id: string; name: string; icon?: string | null; memberCount?: number | null; botPresent?: boolean | null };
  style?: React.CSSProperties;
}) {
  const hue = parseInt(guild.id.slice(-4), 16) % 360;

  return (
    <div
      className="group relative rounded-2xl border border-border bg-card hover:border-white/12 transition-all duration-200 overflow-hidden flex flex-col animate-fade-in-up hover:translate-y-[-2px] hover:shadow-xl"
      style={style}
    >
      {/* Top color stripe + gradient overlay */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ background: `hsl(${hue} 70% 60%)` }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-24 opacity-[0.04] pointer-events-none"
        style={{ background: `linear-gradient(180deg, hsl(${hue} 70% 60%) 0%, transparent 100%)` }}
      />

      <div className="p-5 flex flex-col flex-1 relative">
        {/* Server info */}
        <div className="flex items-center gap-3.5 mb-5">
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
              alt={guild.name}
              className="w-12 h-12 rounded-xl border border-border shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border border-border shadow-md shrink-0 font-bold text-lg"
              style={{ background: `hsl(${hue} 40% 20%)`, color: `hsl(${hue} 70% 70%)` }}
            >
              {guild.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate text-sm text-foreground leading-tight">{guild.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              <span className="text-xs">{(guild.memberCount ?? 0).toLocaleString()} miembros</span>
            </div>
          </div>

          {guild.botPresent && (
            <div className="shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-auto">
          {guild.botPresent ? (
            <Link href={`/servers/${guild.id}`}>
              <Button
                size="sm"
                className="w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/35 transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 border-white/8 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
              onClick={() =>
                window.open(
                  `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID ?? ""}&scope=bot+applications.commands&permissions=8&guild_id=${guild.id}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Agregar Bot
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
