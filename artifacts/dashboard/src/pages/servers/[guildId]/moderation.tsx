import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetModerationConfig, getGetModerationConfigQueryKey, useUpdateModerationConfig, useListModerationActions, getListModerationActionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldBan, AlertTriangle, Hammer, VolumeX, Volume2, UserX, Sparkles } from "lucide-react";

const moderationSchema = z.object({
  enabled: z.boolean(),
  logChannelId: z.string().nullable().optional(),
  muteRoleId: z.string().nullable().optional(),
  autoModEnabled: z.boolean().optional(),
  maxWarnings: z.number().optional(),
});

type ModerationFormValues = z.infer<typeof moderationSchema>;

const ACTION_META: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  ban:    { label: "Ban",    cls: "bg-red-500/15 text-red-400 border border-red-500/25",          icon: Hammer },
  kick:   { label: "Kick",  cls: "bg-orange-500/15 text-orange-400 border border-orange-500/25", icon: UserX },
  warn:   { label: "Warn",  cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25", icon: AlertTriangle },
  mute:   { label: "Mute",  cls: "bg-blue-500/15 text-blue-400 border border-blue-500/25",       icon: VolumeX },
  unmute: { label: "Unmute",cls: "bg-green-500/15 text-green-400 border border-green-500/25",    icon: Volume2 },
  unban:  { label: "Unban", cls: "bg-green-500/15 text-green-400 border border-green-500/25",    icon: Volume2 },
};

export default function ModerationConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading: isConfigLoading } = useGetModerationConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetModerationConfigQueryKey(guildId!) }
  });

  const { data: actions, isLoading: isActionsLoading } = useListModerationActions(guildId!, {
    query: { enabled: !!guildId, queryKey: getListModerationActionsQueryKey(guildId!) }
  });

  const updateConfig = useUpdateModerationConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetModerationConfigQueryKey(guildId!), data);
        toast({ title: "✅ Guardado", description: "Configuración de moderación actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<ModerationFormValues>({
    resolver: zodResolver(moderationSchema),
    defaultValues: { enabled: false, logChannelId: "", muteRoleId: "", autoModEnabled: false, maxWarnings: 3 }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled ?? false,
        logChannelId: config.logChannelId ?? "",
        muteRoleId: config.muteRoleId ?? "",
        autoModEnabled: config.autoModEnabled ?? false,
        maxWarnings: config.maxWarnings ?? 3,
      });
    }
  }, [config, form]);

  const onSubmit = (data: ModerationFormValues) => {
    updateConfig.mutate({
      guildId: guildId!,
      data: {
        enabled: data.enabled,
        logChannelId: data.logChannelId || null,
        muteRoleId: data.muteRoleId || null,
        autoModEnabled: data.autoModEnabled,
        maxWarnings: Number(data.maxWarnings) || 3,
      }
    });
  };

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <ShieldBan className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Moderación</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Logs y herramientas de moderación</p>
          </div>
        </div>

        {isConfigLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="enabled" render={({ field }) => (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <FormItem className="flex items-center justify-between gap-3 space-y-0">
                        <div className="min-w-0">
                          <FormLabel className="font-medium">Moderación activa</FormLabel>
                          <FormDescription className="text-xs mt-0.5">Habilita comandos de mod.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    </CardContent>
                  </Card>
                )} />
                <FormField control={form.control} name="autoModEnabled" render={({ field }) => (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <FormItem className="flex items-center justify-between gap-3 space-y-0">
                        <div className="min-w-0">
                          <FormLabel className="font-medium">Auto-moderación</FormLabel>
                          <FormDescription className="text-xs mt-0.5">Spam y links automáticos.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    </CardContent>
                  </Card>
                )} />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Canales y límites</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="logChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de logs</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="muteRoleId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del rol mute</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="maxWarnings" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máx. advertencias</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormDescription className="text-xs">Antes de acción automática</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Registro de acciones</h2>
            {actions && actions.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border">
                {actions.length} entradas
              </span>
            )}
          </div>

          <Card className="overflow-hidden">
            {isActionsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : actions && actions.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        {[["Tipo","left"], ["Usuario","left"], ["Moderador","left"], ["Razón","left"], ["Fecha","right"]].map(([h, align]) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-${align}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {actions.map(action => {
                        const meta = ACTION_META[action.type ?? ''] ?? ACTION_META['warn'];
                        const Icon = meta.icon;
                        return (
                          <tr key={action.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase ${meta.cls}`}>
                                <Icon className="w-3 h-3" />
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{action.userId}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{action.moderatorId}</td>
                            <td className="px-4 py-3 max-w-[180px] truncate text-sm">
                              {action.reason || <span className="text-muted-foreground italic text-xs">Sin razón</span>}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                              {action.createdAt ? format(new Date(action.createdAt as string), 'dd/MM/yy HH:mm') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {actions.map(action => {
                    const meta = ACTION_META[action.type ?? ''] ?? ACTION_META['warn'];
                    const Icon = meta.icon;
                    return (
                      <div key={action.id} className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase ${meta.cls}`}>
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {action.createdAt ? format(new Date(action.createdAt as string), 'dd/MM/yy HH:mm') : '—'}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p><span className="text-muted-foreground">Usuario: </span><span className="font-mono">{action.userId}</span></p>
                          <p><span className="text-muted-foreground">Mod: </span><span className="font-mono">{action.moderatorId}</span></p>
                          {action.reason && <p className="truncate text-muted-foreground">{action.reason}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                  <ShieldBan className="w-6 h-6 text-muted-foreground opacity-40" />
                </div>
                <p className="text-sm font-medium">Sin acciones registradas</p>
                <p className="text-xs text-muted-foreground mt-1">Los bans, kicks y warns aparecerán aquí.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
