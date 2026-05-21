import { Link, useLocation } from "wouter";
import { useLogout, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Shield, Users, MessageSquare, Ticket, LogOut,
  Activity, UserPlus, Server, ChevronRight, Bot, Settings, Menu, X
} from "lucide-react";

export function SidebarLayout({ children, guildId }: { children: React.ReactNode; guildId?: string }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false }
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
    { href: `/servers/${guildId}`, icon: Activity, label: "Resumen", exact: true, color: "text-blue-400" },
    { href: `/servers/${guildId}/verification`, icon: Shield, label: "Verificación", color: "text-green-400" },
    { href: `/servers/${guildId}/welcome`, icon: UserPlus, label: "Bienvenida", color: "text-emerald-400" },
    { href: `/servers/${guildId}/tickets`, icon: Ticket, label: "Tickets", color: "text-yellow-400" },
    { href: `/servers/${guildId}/moderation`, icon: MessageSquare, label: "Moderación", color: "text-red-400" },
    { href: `/servers/${guildId}/invites`, icon: Users, label: "Invitaciones", color: "text-purple-400" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/30">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">InfernBOT</span>
        <button
          className="ml-auto md:hidden text-muted-foreground hover:text-white transition-colors p-1"
          onClick={closeSidebar}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-1">
        <Link href="/servers" onClick={closeSidebar}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-xs font-medium cursor-pointer">
            <Server className="w-3.5 h-3.5" />
            <span>Mis Servidores</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {guildId ? (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pt-2 pb-1">
              Configuración
            </p>
            {navItems.map((item) => {
              const isActive = item.exact ? location === item.href : location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={closeSidebar}>
                  <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-sm cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : ""}`} />
                    {item.label}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
                  </div>
                </Link>
              );
            })}
          </>
        ) : (
          <div className="text-xs text-muted-foreground px-2 py-2">Selecciona un servidor</div>
        )}
      </nav>

      {user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/5">
            {user.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`}
                alt={user.username}
                className="w-7 h-7 rounded-full shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user.username}</p>
              <p className="text-[10px] text-muted-foreground">Online</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => logout.mutate()}
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground dark overflow-hidden">
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-13 flex items-center gap-3 px-4 border-b border-border shrink-0"
        style={{ background: "hsl(230 15% 6%)", height: "52px" }}
      >
        <button
          className="text-muted-foreground hover:text-white transition-colors p-1 -ml-1"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight text-white">InfernBOT</span>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col border-r border-border"
        style={{ background: "hsl(230 15% 6%)" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "hsl(230 15% 6%)" }}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:pt-0" style={{ paddingTop: "52px" }}>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
