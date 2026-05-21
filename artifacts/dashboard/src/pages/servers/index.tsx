import { useListGuilds, getListGuildsQueryKey } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Settings, Users, Zap, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Servers() {
  const { data: guilds, isLoading, refetch, isFetching } = useListGuilds({
    query: { queryKey: getListGuildsQueryKey() }
  });

  const botGuilds = guilds?.filter(g => g.botPresent) ?? [];
  const otherGuilds = guilds?.filter(g => !g.botPresent) ?? [];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mis Servidores</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Selecciona un servidor donde InfernBOT está activo para configurarlo.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="w-full h-1 -mt-4 mb-4 rounded-none rounded-t-xl" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-9 w-full mt-4 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Servers with bot */}
            {botGuilds.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  InfernBOT activo ({botGuilds.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {botGuilds.map((guild) => (
                    <GuildCard key={guild.id} guild={guild} />
                  ))}
                </div>
              </div>
            )}

            {/* Servers without bot */}
            {otherGuilds.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                  Sin bot ({otherGuilds.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {otherGuilds.map((guild) => (
                    <GuildCard key={guild.id} guild={guild} />
                  ))}
                </div>
              </div>
            )}

            {guilds?.length === 0 && (
              <div className="py-16 text-center border border-dashed rounded-xl border-border">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-base font-semibold">Sin servidores</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                  No tienes servidores donde seas administrador.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

function GuildCard({ guild }: { guild: { id: string; name: string; icon?: string | null; memberCount?: number | null; botPresent?: boolean | null } }) {
  const hue = parseInt(guild.id.slice(-4), 16) % 360;

  return (
    <div className="group rounded-xl border border-border bg-card hover:border-white/15 transition-all overflow-hidden flex flex-col">
      <div className="h-1 w-full shrink-0" style={{ background: `hsl(${hue} 70% 60%)` }} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
              alt={guild.name}
              className="w-11 h-11 rounded-xl border border-border shadow-sm shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center border border-border shadow-sm shrink-0">
              <Server className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-sm">{guild.name}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              <span className="text-xs">{(guild.memberCount ?? 0).toLocaleString()} miembros</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {guild.botPresent ? (
            <Link href={`/servers/${guild.id}`}>
              <Button size="sm" className="w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium">
                <Settings className="w-3.5 h-3.5" />
                Configurar
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 border-white/10 hover:bg-white/5 text-muted-foreground"
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
