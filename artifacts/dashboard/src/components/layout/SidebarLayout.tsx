import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useGetGuild, getGetGuildQueryKey } from "@workspace/api-client-react";
import {
  Shield,
  Users,
  Ticket,
  ShieldBan,
  UserPlus,
  LayoutDashboard,
  ChevronLeft,
  Menu,
  LogOut,
  Server,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "", icon: LayoutDashboard, label: "Panel",        color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    activeBg: "bg-blue-500/15",    activeBorder: "border-blue-500/30",    activeText: "text-blue-300" },
  { href: "/verification", icon: Shield,    label: "Verificación", color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20",   activeBg: "bg-green-500/15",   activeBorder: "border-green-500/30",   activeText: "text-green-300" },
  { href: "/welcome",      icon: UserPlus,  label: "Bienvenida",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", activeBg: "bg-emerald-500/15", activeBorder: "border-emerald-500/30", activeText: "text-emerald-300" },
  { href: "/tickets",      icon: Ticket,    label: "Tickets",      color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  activeBg: "bg-yellow-500/15",  activeBorder: "border-yellow-500/30",  activeText: "text-yellow-300" },
  { href: "/moderation",   icon: ShieldBan, label: "Moderación",   color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     activeBg: "bg-red-500/15",     activeBorder: "border-red-500/30",     activeText: "text-red-300" },
  { href: "/invites",      icon: Users,     label: "Invitaciones", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  activeBg: "bg-purple-500/15",  activeBorder: "border-purple-500/30",  activeText: "text-purple-300" },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  guildId?: string;
}

export function SidebarLayout({ children, guildId }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false, queryKey: ["getMe"] } });
  const { data: guild } = useGetGuild(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetGuildQueryKey(guildId ?? "") },
  });

  const guildBase = guildId ? `/servers/${guildId}` : null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/25 shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm tracking-tight leading-none">InfernBOT</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Nexus Control</p>
        </div>
      </div>

      {/* Guild info banner */}
      {guildId && guild && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/8 flex items-center gap-2.5">
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=32`}
              alt={guild.name}
              className="w-8 h-8 rounded-lg border border-border shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate leading-tight">{guild.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {guild.memberCount?.toLocaleString()} miembros
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Back to servers */}
        {guildId && (
          <>
            <Link href="/servers">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-1">
                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                Mis servidores
              </button>
            </Link>
            <Separator className="my-2 opacity-30" />
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 pb-2">Módulos</p>
          </>
        )}

        {!guildId && (
          <Link href="/servers">
            <button
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                location === "/servers"
                  ? "bg-[#5865F2]/15 text-[#8b9cf8] border border-[#5865F2]/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border", "bg-[#5865F2]/10 border-[#5865F2]/20")}>
                <Server className="w-3.5 h-3.5 text-[#5865F2]" />
              </div>
              Servidores
            </button>
          </Link>
        )}

        {guildId && guildBase && NAV_ITEMS.map(({ href, icon: Icon, label, color, bg, border, activeBg, activeBorder, activeText }) => {
          const fullPath = `${guildBase}${href}`;
          const isActive = location === fullPath || (href === "" && location === guildBase);

          return (
            <Link key={href} href={fullPath}>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? `${activeBg} ${activeText} border ${activeBorder}`
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                  isActive ? `${bg} ${border} shadow-sm` : `${bg} ${border}`
                )}>
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                <span className="flex-1 text-left">{label}</span>
                {isActive && (
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.replace("text-", "bg-"))} />
                )}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.03] border border-white/6">
            {user.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=32`}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-border shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center shrink-0 text-xs font-bold text-[#8b9cf8]">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user.username}</p>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Conectado
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-8 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex dark">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-58 border-r border-border bg-card/40 shrink-0 sticky top-0 h-screen" style={{ width: "232px" }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full border-r border-border bg-background z-10" style={{ width: "232px" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm truncate">
              {guild?.name ?? "InfernBOT"}
            </span>
          </div>
          {user?.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=32`}
              alt={user.username}
              className="w-7 h-7 rounded-full border border-border shrink-0"
            />
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
