import { Link, useLocation } from "wouter";
import { useLogout, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Shield, Users, MessageSquare, Ticket, LogOut,
  Activity, UserPlus, Server, ChevronRight, Bot, Settings, Menu, X
} from "lucide-react";

const NAV_ITEMS = [
  { href: (id: string) => `/servers/${id}`,              icon: Activity,     label: "Resumen",      exact: true, color: "text-blue-400",    activeGlow: "bg-blue-500/10"   },
  { href: (id: string) => `/servers/${id}/verification`, icon: Shield,       label: "Verificación",              color: "text-green-400",   activeGlow: "bg-green-500/10"  },
  { href: (id: string) => `/servers/${id}/welcome`,      icon: UserPlus,     label: "Bienvenida",                color: "text-emerald-400", activeGlow: "bg-emerald-500/10"},
  { href: (id: string) => `/servers/${id}/tickets`,      icon: Ticket,       label: "Tickets",                   color: "text-yellow-400",  activeGlow: "bg-yellow-500/10" },
  { href: (id: string) => `/servers/${id}/moderation`,   icon: MessageSquare,label: "Moderación",                color: "text-red-400",     activeGlow: "bg-red-500/10"    },
  { href: (id: string) => `/servers/${id}/invites`,      icon: Users,        label: "Invitaciones",              color: "text-purple-400",  activeGlow: "bg-purple-500/10" },
];

interface SidebarContentProps {
  guildId?: string;
  location: string;
  user: { id: string; username: string; avatar?: string | null } | undefined;
  onLogout: () => void;
  onClose: () => void;
  showCloseButton: boolean;
}

function SidebarContent({ guildId, location, user, onLogout, onClose, showCloseButton }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border/60 shrink-0">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-[#5865F2]/40 blur-md" />
          <div className="relative w-8 h-8 rounded-xl bg-[#5865F2] flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-black text-sm tracking-tight text-white">InfernBOT</span>
          <div className="flex items-center gap-1 mt-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-muted-foreground">Online</span>
          </div>
        </div>
        {showCloseButton && (
          <button
            className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Back to servers */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <Link href="/servers" onClick={onClose}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-xs font-medium cursor-pointer group">
            <Server className="w-3.5 h-3.5 shrink-0" />
            <span>Mis Servidores</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto min-h-0">
        {guildId ? (
          <>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2.5 pt-3 pb-2">
              Módulos
            </p>
            {NAV_ITEMS.map((item) => {
              const href = item.href(guildId);
              const isActive = item.exact ? location === href : location.startsWith(href);
              return (
                <Link key={href} href={href} onClick={onClose}>
                  <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-sm cursor-pointer ${
                    isActive
                      ? `${item.activeGlow} text-white font-semibold border border-white/8`
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : ""}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace("text-", "bg-")}`} />
                    )}
                  </div>
                </Link>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Settings className="w-6 h-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/60 text-center">Selecciona un servidor<br />para ver las opciones</p>
          </div>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-3 border-t border-border/60 shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-xs text-white">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-sidebar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{user.username}</p>
              <p className="text-[10px] text-muted-foreground">Administrador</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg transition-all"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const closeSidebar = () => setSidebarOpen(false);
  const handleLogout = () => logout.mutate();

  return (
    <div className="flex h-screen bg-background text-foreground dark overflow-hidden">
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 border-b border-border/60 shrink-0"
        style={{ background: "hsl(230 18% 5%)", height: "52px" }}
      >
        <button
          className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 -ml-1"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-[#5865F2]/40 blur-sm" />
          <div className="relative w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <span className="font-black text-sm tracking-tight text-white">InfernBOT</span>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60"
        style={{ background: "hsl(230 18% 5%)" }}
      >
        <SidebarContent
          guildId={guildId}
          location={location}
          user={user}
          onLogout={handleLogout}
          onClose={closeSidebar}
          showCloseButton={false}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/60 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "hsl(230 18% 5%)" }}
      >
        <SidebarContent
          guildId={guildId}
          location={location}
          user={user}
          onLogout={handleLogout}
          onClose={closeSidebar}
          showCloseButton={true}
        />
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
