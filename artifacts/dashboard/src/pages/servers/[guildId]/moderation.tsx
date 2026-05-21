import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetModerationConfig, getGetModerationConfigQueryKey, useUpdateModerationConfig, useListModerationActions, getListModerationActionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const moderationSchema = z.object({
  enabled: z.boolean(),
  logChannelId: z.string().nullable().optional(),
  muteRoleId: z.string().nullable().optional(),
  autoModEnabled: z.boolean().optional(),
  maxWarnings: z.number().optional(),
});

type ModerationFormValues = z.infer<typeof moderationSchema>;

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
        toast({ title: "Guardado", description: "Configuración de moderación actualizada." });
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderación</h1>
          <p className="text-muted-foreground mt-2">Configura los logs y herramientas de moderación. Los cambios aplican inmediatamente.</p>
        </div>

        {isConfigLoading ? <Skeleton className="h-[400px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Configuración de moderación</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="enabled" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Activar moderación</FormLabel>
                          <CardDescription>Habilita los comandos de moderación.</CardDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="autoModEnabled" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-moderación</FormLabel>
                          <CardDescription>Maneja spam y enlaces automáticamente.</CardDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="logChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de logs de moderación</FormLabel>
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
                        <FormLabel>Máx. advertencias antes de acción</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={updateConfig.isPending}>
                      {updateConfig.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Registro de acciones</h2>
          <Card className="overflow-hidden">
            {isActionsLoading ? (
              <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : actions && actions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Moderador</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead className="text-right">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.map(action => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            action.type === 'ban' ? 'bg-destructive/20 text-destructive' :
                            action.type === 'kick' ? 'bg-orange-500/20 text-orange-500' :
                            action.type === 'mute' ? 'bg-yellow-500/20 text-yellow-500' :
                            action.type === 'unmute' ? 'bg-green-500/20 text-green-500' :
                            'bg-primary/20 text-primary'
                          }`}>{action.type}</span>
                        </TableCell>
                        <TableCell className="font-medium">{action.targetUsername}</TableCell>
                        <TableCell className="text-muted-foreground">{action.moderatorUsername}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={action.reason || ''}>
                          {action.reason || <span className="text-muted-foreground italic">Sin razón</span>}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                          {format(new Date(action.createdAt), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No hay acciones de moderación registradas.</div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
