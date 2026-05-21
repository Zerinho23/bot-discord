import { useListGuilds, getListGuildsQueryKey } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Servers() {
  const { data: guilds, isLoading } = useListGuilds({
    query: {
      queryKey: getListGuildsQueryKey()
    }
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Servers</h1>
          <p className="text-muted-foreground mt-2">Select a server to configure Nexus Bot.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds?.map((guild) => (
              <Card key={guild.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col group overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-14 h-14 rounded-full border border-border shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
                      <Server className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{guild.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{guild.memberCount.toLocaleString()} members</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto pt-2">
                  {guild.botPresent ? (
                    <Link href={`/servers/${guild.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2">
                        <Settings className="w-4 h-4" /> Configure
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/10 text-primary" onClick={() => window.open(`https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8&guild_id=${guild.id}`, "_blank")}>
                      <ExternalLink className="w-4 h-4" /> Add Bot
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {guilds?.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed rounded-lg border-border bg-card/50">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No servers found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">You don't have manage server permissions in any guilds, or you need to login again.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}