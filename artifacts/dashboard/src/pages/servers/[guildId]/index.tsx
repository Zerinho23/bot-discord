import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetGuildStats, getGetGuildStatsQueryKey, useGetGuild, getGetGuildQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, ShieldBan, Ticket, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ServerOverview() {
  const { guildId } = useParams();

  const { data: guild, isLoading: isLoadingGuild } = useGetGuild(guildId!, {
    query: {
      enabled: !!guildId,
      queryKey: getGetGuildQueryKey(guildId!)
    }
  });

  const { data: stats, isLoading: isLoadingStats } = useGetGuildStats(guildId!, {
    query: {
      enabled: !!guildId,
      queryKey: getGetGuildStatsQueryKey(guildId!)
    }
  });

  const isLoading = isLoadingGuild || isLoadingStats;

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {isLoading ? <Skeleton className="w-48 h-9" /> : guild?.name}
          </h1>
          <p className="text-muted-foreground mt-2">Server overview and statistics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalMembers.toLocaleString() ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalWarnings.toLocaleString() ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Bans</CardTitle>
              <ShieldBan className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalBans.toLocaleString() ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.openTickets.toLocaleString() ?? 0}
                  <span className="text-sm text-muted-foreground font-normal ml-2">/ {stats?.totalTickets.toLocaleString() ?? 0} total</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Recent Moderation Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentActions && stats.recentActions.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentActions.map(action => (
                  <div key={action.id} className="py-3 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${action.type === 'ban' ? 'bg-destructive/20 text-destructive' : action.type === 'warn' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-primary/20 text-primary'}`}>
                          {action.type}
                        </span>
                        <span className="font-medium">{action.targetUsername}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Reason: {action.reason || 'None provided'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm">
                      <span className="text-muted-foreground">{format(new Date(action.createdAt), 'MMM d, h:mm a')}</span>
                      <span className="text-muted-foreground text-xs">by {action.moderatorUsername}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent moderation actions.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}