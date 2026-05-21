import { Link, useLocation } from "wouter";
import { useLogout, useGetMe, getGetMeQueryKey, useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, Users, MessageSquare, Ticket, LogOut, Activity, UserPlus, Server } from "lucide-react";

export function SidebarLayout({ children, guildId }: { children: React.ReactNode; guildId?: string }) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  const { data: health } = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey(),
      refetchInterval: 30000,
    }
  });

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        window.location.href = "/";
      }
    }
  });

  const navItems = [
    { href: `/servers/${guildId}`, icon: Activity, label: "Overview", exact: true },
    { href: `/servers/${guildId}/verification`, icon: Shield, label: "Verification" },
    { href: `/servers/${guildId}/welcome`, icon: UserPlus, label: "Welcome" },
    { href: `/servers/${guildId}/tickets`, icon: Ticket, label: "Tickets" },
    { href: `/servers/${guildId}/moderation`, icon: MessageSquare, label: "Moderation" },
    { href: `/servers/${guildId}/invites`, icon: Users, label: "Invites" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border h-16 flex items-center justify-between">
          <Link href="/servers" className="font-bold text-lg tracking-tight hover:text-primary transition-colors flex items-center gap-2">
            <Server className="w-5 h-5" /> Dashboard
          </Link>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          {guildId ? navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          }) : (
            <div className="text-sm text-muted-foreground px-3 py-2">Select a server to manage</div>
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border mt-auto">
          {user && (
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full bg-secondary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase">{user.username.slice(0, 2)}</div>
                )}
                <div className="text-sm font-medium truncate w-24">{user.username}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout.mutate()} title="Log out" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 shrink-0">
           {/* Top nav if needed */}
        </header>
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-5xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}