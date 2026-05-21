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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const inviteSchema = z.object({
  enabled: z.boolean(),
  announceChannelId: z.string().nullable().optional(),
  announceMessage: z.string().nullable().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

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
        toast({ title: "Guardado", description: "Configuración de invitaciones actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { enabled: false, announceChannelId: "", announceMessage: "" }
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

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitaciones</h1>
          <p className="text-muted-foreground mt-2">Rastrea quién invita a quién y configura los anuncios de invitación.</p>
        </div>

        {isConfigLoading ? <Skeleton className="h-[300px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Configuración de invitaciones</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Activar tracking de invitaciones</FormLabel>
                        <CardDescription>Registra quién invita a cada miembro y sus estadísticas.</CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="announceChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de anuncios de invitación</FormLabel>
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
                            {...field}
                            value={field.value || ''}
                          />
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
          <h2 className="text-xl font-bold tracking-tight">Leaderboard de invitaciones</h2>
          <Card className="overflow-hidden">
            {isStatsLoading ? (
              <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : stats && stats.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Válidas</TableHead>
                      <TableHead className="text-right">Falsas</TableHead>
                      <TableHead className="text-right">Se fueron</TableHead>
                      <TableHead className="text-right font-bold text-primary">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.sort((a, b) => (b.regularInvites - b.leftInvites - b.fakeInvites) - (a.regularInvites - a.leftInvites - a.fakeInvites)).map((stat, idx) => (
                      <TableRow key={stat.userId}>
                        <TableCell className="font-medium text-muted-foreground">#{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {stat.avatar ? (
                              <img src={`https://cdn.discordapp.com/avatars/${stat.userId}/${stat.avatar}.webp?size=32`} alt={stat.username ?? stat.userId} className="w-8 h-8 rounded-full border border-border" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase border border-border">
                                {(stat.username ?? stat.userId).slice(0, 2)}
                              </div>
                            )}
                            <span className="font-medium">{stat.username ?? stat.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-500">{stat.regularInvites}</TableCell>
                        <TableCell className="text-right text-destructive">{stat.fakeInvites}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{stat.leftInvites}</TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">{stat.regularInvites - stat.leftInvites - stat.fakeInvites}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No hay datos de invitaciones aún.</div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
