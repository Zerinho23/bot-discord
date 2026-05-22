import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetInviteConfig, getGetInviteConfigQueryKey, useUpdateInviteConfig, useListInviteStats, getListInviteStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Trophy, Sparkles } from "lucide-react";

const inviteSchema = z.object({
  enabled: z.boolean(),
  announceChannelId: z.string().nullable().optional(),
  announceMessage: z.string().nullable().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const MEDAL = ["🥇", "🥈", "🥉"];

export default function InviteConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading: isConfigLoading } = useGetInviteConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetInviteConfigQueryKey(guildId!) }
  });

  const { data: stats, isLoading: isStatsLoading } = useListInviteStats(guildId!, {
    query: { enabled: !!guildId, queryKey: getListInviteStatsQueryKey(guildId!) }
  });

  const updateConfig = useUpdateInviteConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetInviteConfigQueryKey(guildId!), data);
        toast({ title: "✅ Guardado", description: "Configuración de invitaciones actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      enabled: false,
      announceChannelId: "",
      announceMessage: "¡{user} se ha unido gracias a **{inviter}**! Ya tiene **{invites}** invitaciones. 🎉",
    }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled ?? false,
        announceChannelId: config.announceChannelId ?? "",
        announceMessage: config.announceMessage ?? "",
      });
    }
  }, [config, form]);

  const onSubmit = (data: InviteFormValues) => {
    updateConfig.mutate({
      guildId: guildId!,
      data: {
        enabled: data.enabled,
        announceChannelId: data.announceChannelId || null,
        announceMessage: data.announceMessage || null,
      }
    });
  };

  const sorted = stats
    ? [...stats].sort((a, b) =>
        (b.regularInvites - b.leftInvites - b.fakeInvites) - (a.regularInvites - a.leftInvites - a.fakeInvites)
      )
    : [];

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Invitaciones</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Rastrea invitaciones y anuncia nuevos miembros</p>
          </div>
        </div>

        {isConfigLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 space-y-0">
                      <div>
                        <FormLabel className="font-medium">Activar tracking de invitaciones</FormLabel>
                        <CardDescription className="text-xs mt-0.5">
                          Registra quién invita a cada miembro y sus estadísticas.
                        </CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Anuncios de invitación</CardTitle>
                  <CardDescription>Mensajes automáticos cuando alguien se une con una invitación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="announceChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de anuncios</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="announceMessage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje de anuncio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="{user} fue invitado por {inviter}. ¡Ya tiene {invites} invitaciones!"
                            className="resize-none min-h-[80px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Variables hint */}
                  <div className="flex flex-wrap gap-2">
                    {["{user}", "{inviter}", "{invites}", "{server}"].map(v => (
                      <span key={v} className="text-xs bg-muted/40 border border-border rounded px-2 py-1 font-mono text-primary">{v}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateConfig.isPending} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  {updateConfig.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h2 className="text-lg font-bold tracking-tight">Leaderboard</h2>
            </div>
            {sorted.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border">
                {sorted.length} miembros
              </span>
            )}
          </div>

          <Card className="overflow-hidden">
            {isStatsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : sorted.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14">Pos.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuario</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-green-400/70 uppercase tracking-wider">Válidas</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-red-400/70 uppercase tracking-wider">Falsas</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Se fueron</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-primary uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sorted.map((stat, idx) => {
                        const net = stat.regularInvites - stat.leftInvites - stat.fakeInvites;
                        return (
                          <tr key={stat.userId} className={`hover:bg-muted/20 transition-colors ${idx === 0 ? "bg-yellow-500/5" : ""}`}>
                            <td className="px-4 py-3 text-lg">{MEDAL[idx] ?? `#${idx + 1}`}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {stat.avatar ? (
                                  <img
                                    src={`https://cdn.discordapp.com/avatars/${stat.userId}/${stat.avatar}.webp?size=32`}
                                    alt={stat.username ?? stat.userId}
                                    className="w-8 h-8 rounded-full border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center font-bold text-xs text-[#5865F2] shrink-0">
                                    {(stat.username ?? stat.userId).slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span className="font-medium">{stat.username ?? stat.userId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-green-400 font-medium">{stat.regularInvites}</td>
                            <td className="px-4 py-3 text-right text-red-400">{stat.fakeInvites}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{stat.leftInvites}</td>
                            <td className="px-4 py-3 text-right font-bold text-primary text-base">{net}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {sorted.map((stat, idx) => {
                    const net = stat.regularInvites - stat.leftInvites - stat.fakeInvites;
                    return (
                      <div key={stat.userId} className={`p-4 flex items-center gap-3 ${idx === 0 ? "bg-yellow-500/5" : ""}`}>
                        <div className="text-xl w-8 text-center shrink-0">{MEDAL[idx] ?? `#${idx + 1}`}</div>
                        {stat.avatar ? (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${stat.userId}/${stat.avatar}.webp?size=32`}
                            alt={stat.username ?? stat.userId}
                            className="w-9 h-9 rounded-full border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center font-bold text-xs text-[#5865F2] shrink-0">
                            {(stat.username ?? stat.userId).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{stat.username ?? stat.userId}</p>
                          <div className="flex gap-3 text-xs mt-0.5">
                            <span className="text-green-400">{stat.regularInvites} válidas</span>
                            <span className="text-red-400">{stat.fakeInvites} falsas</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-primary">{net}</p>
                          <p className="text-[10px] text-muted-foreground">total</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-muted-foreground opacity-40" />
                </div>
                <p className="text-sm font-medium">Sin datos de invitaciones</p>
                <p className="text-xs text-muted-foreground mt-1">Activa el tracking para ver el leaderboard.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
