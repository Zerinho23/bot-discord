import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetGuildStats, getGetGuildStatsQueryKey, useGetGuild, getGetGuildQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, ShieldBan, Ticket, UserPlus, Shield, MessageSquare, ChevronRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

const ACTION_STYLES: Record<string, { label: string; cls: string }> = {
  ban:    { label: "Ban",    cls: "bg-red-500/15 text-red-400 border border-red-500/20" },
  kick:   { label: "Kick",  cls: "bg-orange-500/15 text-orange-400 border border-orange-500/20" },
  warn:   { label: "Warn",  cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" },
  mute:   { label: "Mute",  cls: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
  unmute: { label: "Unmute",cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
  unban:  { label: "Unban", cls: "bg-green-500/15 text-green-400 border border-green-500/20" },
};

const QUICK_LINKS = [
  { href: "verification", icon: Shield,   label: "Verificación", desc: "Panel de captcha",    color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20",   glow: "group-hover:shadow-green-500/10" },
  { href: "welcome",      icon: UserPlus, label: "Bienvenida",   desc: "Embed de entrada",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "group-hover:shadow-emerald-500/10" },
  { href: "tickets",      icon: Ticket,   label: "Tickets",      desc: "Sistema de soporte", color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  glow: "group-hover:shadow-yellow-500/10" },
  { href: "moderation",   icon: ShieldBan,label: "Moderación",   desc: "Acciones y logs",    color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     glow: "group-hover:shadow-red-500/10" },
  { href: "invites",      icon: Users,    label: "Invitaciones", desc: "Tracker de invites", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  glow: "group-hover:shadow-purple-500/10" },
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
    { label: "Miembros",        value: stats?.totalMembers ?? 0,  icon: Users,        color: "text-blue-400",    bg: "bg-blue-500/10",     border: "border-blue-500/20",     glow: "rgba(59,130,246,0.15)" },
    { label: "Advertencias",    value: stats?.totalWarnings ?? 0, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10",   border: "border-yellow-500/20",   glow: "rgba(234,179,8,0.15)" },
    { label: "Bans",            value: stats?.totalBans ?? 0,     icon: ShieldBan,    color: "text-red-400",     bg: "bg-red-500/10",      border: "border-red-500/20",      glow: "rgba(239,68,68,0.15)" },
    { label: "Tickets abiertos",value: stats?.openTickets ?? 0,   icon: Ticket,       color: "text-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/20",  glow: "rgba(16,185,129,0.15)",
      sub: stats ? `de ${stats.totalTickets} totales` : undefined },
  ];

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4 pb-2">
          {isLoadingGuild ? (
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          ) : guild?.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
              alt={guild.name}
              className="w-14 h-14 rounded-2xl border border-border shadow-xl shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center shrink-0 shadow-xl">
              <MessageSquare className="w-7 h-7 text-[#5865F2]" />
            </div>
          )}
          <div className="min-w-0">
            {isLoadingGuild ? (
              <Skeleton className="w-44 h-7 mb-1.5" />
            ) : (
              <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">{guild?.name}</h1>
            )}
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Panel de control
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up-delay-1">
          {statCards.map((s) => (
            <Card
              key={s.label}
              className="border-border bg-card hover:border-white/10 transition-all duration-200 overflow-hidden group hover:translate-y-[-1px]"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0 shadow-sm`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    <>
                      <p className="text-2xl md:text-3xl font-black tracking-tight">{s.value.toLocaleString()}</p>
                      {s.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent moderation actions */}
        {stats?.recentActions && stats.recentActions.length > 0 && (
          <div className="space-y-3 animate-fade-in-up-delay-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                Acciones recientes
              </h2>
              <Link href={`/servers/${guildId}/moderation`}>
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                  Ver todas <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <Card className="overflow-hidden border-border">
              <div className="divide-y divide-border">
                {stats.recentActions.slice(0, 5).map((action: any) => {
                  const meta = ACTION_STYLES[action.type] ?? ACTION_STYLES['warn'];
                  return (
                    <div key={action.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 tracking-wide ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{action.userId}</span>
                      {action.reason && (
                        <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:block italic">{action.reason}</span>
                      )}
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {action.createdAt ? format(new Date(action.createdAt as string), 'dd/MM HH:mm') : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-3 animate-fade-in-up-delay-3">
          <h2 className="text-base font-bold">Configuración rápida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
              <Link key={href} href={`/servers/${guildId}/${href}`}>
                <div className="group flex items-center gap-3.5 p-4 rounded-xl border border-border bg-card hover:border-white/12 hover:bg-white/[0.025] transition-all duration-200 cursor-pointer hover:translate-y-[-1px]">
                  <div className={`w-10 h-10 rounded-xl border ${border} ${bg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
