import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Users, BarChart3, CheckCircle2 } from "lucide-react";

const FEATURES = [
  { icon: Shield, label: "Moderación avanzada", desc: "Ban, kick, mute, warns automáticos" },
  { icon: Users, label: "Sistema de verificación", desc: "Captcha y roles automáticos" },
  { icon: Zap, label: "Tickets de soporte", desc: "Gestión completa de tickets" },
  { icon: BarChart3, label: "Estadísticas de invites", desc: "Ranking y tracking en tiempo real" },
];

export default function Login() {
  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  if (isLoading) return null;
  if (user) return <Redirect to="/servers" />;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground dark">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#5865F2]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#5865F2]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Top badge */}
      <div className="relative z-10 mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 text-xs font-medium text-[#8b9cf8]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          InfernBOT — Panel de control oficial
        </div>
      </div>

      {/* Main heading */}
      <div className="relative z-10 text-center mb-10 animate-fade-in-up-delay-1 max-w-2xl px-4">
        <div className="flex items-center justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-[#5865F2]/30 blur-xl" />
            <div className="relative w-20 h-20 bg-[#5865F2] rounded-2xl flex items-center justify-center shadow-2xl glow-primary">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none">
          <span className="shimmer-text">Nexus Control</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          La suite de moderación y gestión comunitaria más completa para Discord.
        </p>
      </div>

      {/* Feature pills */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-10 px-4 animate-fade-in-up-delay-2 max-w-lg">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
          >
            <Icon className="w-3 h-3 text-[#5865F2]" />
            {label}
          </div>
        ))}
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm px-4 animate-fade-in-up-delay-3">
        <div className="glass-card rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-foreground">Acceder al panel</h2>
            <p className="text-muted-foreground text-sm mt-1">Inicia sesión con tu cuenta de Discord</p>
          </div>

          <Button
            size="lg"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white gap-3 font-semibold h-12 text-base shadow-lg shadow-[#5865F2]/25 transition-all hover:shadow-[#5865F2]/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => window.location.href = "/api/auth/discord"}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Continuar con Discord
          </Button>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span>Autenticación segura mediante OAuth2 de Discord</span>
          </div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="relative z-10 mt-12 flex items-center gap-8 text-center animate-fade-in-up-delay-4">
        {[
          { val: "11", label: "Comandos" },
          { val: "6", label: "Módulos" },
          { val: "100%", label: "Open source" },
        ].map(({ val, label }) => (
          <div key={label}>
            <div className="text-xl font-black text-foreground">{val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <p className="relative z-10 mt-10 text-xs text-muted-foreground/50">
        © 2026 InfernBOT · Todos los derechos reservados
      </p>
    </div>
  );
}
