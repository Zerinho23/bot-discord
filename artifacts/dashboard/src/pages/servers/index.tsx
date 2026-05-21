import { useListGuilds, getListGuildsQueryKey } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Settings, Users, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Servers() {
  const { data: guilds, isLoading } = useListGuilds({
    query: { queryKey: getListGuildsQueryKey() }
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tus Servidores</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Selecciona un servidor donde InfernBOT está activo para configurarlo.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds?.map((guild) => (
              <div
                key={guild.id}
                className="group rounded-xl border border-border bg-card hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Colored top bar based on guild ID for visual variety */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `hsl(${parseInt(guild.id.slice(-4), 16) % 360} 70% 60%)`
                  }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {guild.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
                        alt={guild.name}
                        className="w-12 h-12 rounded-xl border border-border shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border shadow-sm shrink-0">
                        <Server className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{guild.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">{(guild.memberCount ?? 0).toLocaleString()} miembros</span>
                      </div>
                    </div>
                  </div>

                  {guild.botPresent ? (
                    <Link href={`/servers/${guild.id}`}>
                      <Button
                        size="sm"
                        className="w-full gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Configurar
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2 border-white/10 hover:bg-white/5"
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
            ))}

            {guilds?.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed rounded-xl border-border">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold">Sin servidores</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                  InfernBOT no está en ningún servidor donde tengas permisos de administrador.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
