import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import {
  Shield,
  Users,
  Ticket,
  ShieldBan,
  UserPlus,
  LayoutDashboard,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "", icon: LayoutDashboard, label: "Panel", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { href: "/verification", icon: Shield, label: "Verificación", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  { href: "/welcome", icon: UserPlus, label: "Bienvenida", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { href: "/tickets", icon: Ticket, label: "Tickets", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { href: "/moderation", icon: ShieldBan, label: "Moderación", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { href: "/invites", icon: Users, label: "Invitaciones", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
  guildId?: string;
}

export function SidebarLayout({ children, guildId }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false, queryKey: ["getMe"] } });

  const guildBase = guildId ? `/servers/${guildId}` : null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/25 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm tracking-tight leading-none">InfernBOT</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Panel de control</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Back to servers */}
        {guildId && (
          <>
            <Link href="/servers">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-1">
                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                Mis servidores
              </button>
            </Link>
            <Separator className="my-2 opacity-40" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 pb-1">Módulos</p>
          </>
        )}

        {!guildId && (
          <>
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
          </>
        )}

        {guildId && guildBase && NAV_ITEMS.map(({ href, icon: Icon, label, color, bg, border }) => {
          const fullPath = `${guildBase}${href}`;
          const isActive = location === fullPath || (href === "" && location === guildBase);

          return (
            <Link key={href} href={fullPath}>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/8 text-foreground border border-white/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border", bg, border)}>
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                {label}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-4">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/[0.03] border border-white/6 mb-2">
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
              <p className="text-[10px] text-muted-foreground">Conectado</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-8"
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
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 border-r border-border bg-background z-10">
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5865F2] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">InfernBOT</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
