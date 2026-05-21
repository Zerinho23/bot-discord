import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetGuildStats, getGetGuildStatsQueryKey, useGetGuild, getGetGuildQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, ShieldBan, Ticket, UserPlus, Shield, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

const ACTION_STYLES: Record<string, { label: string; cls: string }> = {
  ban:    { label: "Ban",      cls: "bg-red-500/15 text-red-400 border border-red-500/20" },
  kick:   { label: "Kick",     cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20" },
  warn:   { label: "Warn",     cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" },
  mute:   { label: "Mute",     cls: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
  unmute: { label: "Unmute",   cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
  unban:  { label: "Unban",    cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
};

const QUICK_LINKS = [
  { href: "verification", icon: Shield, label: "Verificación", desc: "Panel de captcha", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { href: "welcome", icon: UserPlus, label: "Bienvenida", desc: "Embed de entrada", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { href: "tickets", icon: Ticket, label: "Tickets", desc: "Sistema de soporte", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { href: "moderation", icon: ShieldBan, label: "Moderación", desc: "Acciones y logs", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { href: "invites", icon: Users, label: "Invitaciones", desc: "Tracker de invites", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

export default function ServerOverview() {
  const { guildId } = useParams();

  const { data: guild, isLoading: isLoadingGuild } = useGetGuild(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetGuildQueryKey(guildId!) }
  });

  const { data: stats, isLoading: isLoadingStats } = useGetGuildStats(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetGuildStatsQueryKey(guildId!) }
  });

  const isLoading = isLoadingGuild || isLoadingStats;

  const statCards = [
    { label: "Miembros", value: stats?.totalMembers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Advertencias", value: stats?.totalWarnings ?? 0, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Bans", value: stats?.totalBans ?? 0, icon: ShieldBan, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Tickets abiertos", value: stats?.openTickets ?? 0, icon: Ticket, sub: `/ ${stats?.totalTickets ?? 0} total`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <SidebarLayout guildId={guildId}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {isLoadingGuild ? (
          <Skeleton className="w-14 h-14 rounded-2xl" />
        ) : guild?.icon ? (
          <img
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
            alt={guild.name}
            className="w-14 h-14 rounded-2xl border border-border shadow-lg"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-[#5865F2]" />
          </div>
        )}
        <div>
          {isLoadingGuild ? (
            <Skeleton className="w-48 h-7 mb-1" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{guild?.name}</h1>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">Panel de control del servidor</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border bg-card hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold">{s.value.toLocaleString()}</span>
                  {s.sub && <span className="text-xs text-muted-foreground">{s.sub}</span>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent actions */}
        <Card className="lg:col-span-3 border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldBan className="w-4 h-4 text-muted-foreground" />
              Acciones recientes de moderación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stats?.recentActions && stats.recentActions.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentActions.map(action => {
                  const style = ACTION_STYLES[action.type] ?? { label: action.type, cls: "bg-muted text-muted-foreground" };
                  return (
                    <div key={action.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0 ${style.cls}`}>
                        {style.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{action.userId}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.reason || "Sin razón"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {action.createdAt ? format(new Date(action.createdAt as string), "d MMM, HH:mm") : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Sin acciones recientes de moderación
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 pb-1">
            Módulos
          </p>
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={`/servers/${guildId}/${item.href}`}>
              <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-white/5 transition-all cursor-pointer ${item.bg}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="ml-auto text-muted-foreground">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
