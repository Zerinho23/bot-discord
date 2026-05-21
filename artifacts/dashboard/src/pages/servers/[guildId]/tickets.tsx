import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetTicketConfig, getGetTicketConfigQueryKey, useUpdateTicketConfig, useListTickets, getListTicketsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DiscordEmbedPreview } from "@/components/ui/DiscordEmbedPreview";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const ticketSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  supportRoleId: z.string().nullable().optional(),
  logChannelId: z.string().nullable().optional(),
  embedTitle: z.string().nullable().optional(),
  embedDescription: z.string().nullable().optional(),
  embedColor: z.string().nullable().optional(),
  buttonLabel: z.string().nullable().optional(),
  buttonEmoji: z.string().nullable().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function TicketConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading: isConfigLoading } = useGetTicketConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetTicketConfigQueryKey(guildId!) }
  });

  const { data: tickets, isLoading: isTicketsLoading } = useListTickets(guildId!, {
    query: { enabled: !!guildId, queryKey: getListTicketsQueryKey(guildId!) }
  });

  const updateConfig = useUpdateTicketConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetTicketConfigQueryKey(guildId!), data);
        toast({ title: "Guardado", description: "Configuración de tickets actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { enabled: false, channelId: "", categoryId: "", supportRoleId: "", logChannelId: "", embedTitle: "", embedDescription: "", embedColor: "#5865F2", buttonLabel: "", buttonEmoji: "" }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled ?? false,
        channelId: config.channelId ?? "",
        categoryId: config.categoryId ?? "",
        supportRoleId: config.supportRoleId ?? "",
        logChannelId: config.logChannelId ?? "",
        embedTitle: config.embedTitle ?? "",
        embedDescription: config.embedDescription ?? "",
        embedColor: config.embedColor ?? "#5865F2",
        buttonLabel: config.buttonLabel ?? "",
        buttonEmoji: config.buttonEmoji ?? "",
      });
    }
  }, [config, form]);

  const onSubmit = (data: TicketFormValues) => {
    updateConfig.mutate({
      guildId: guildId!,
      data: {
        enabled: data.enabled,
        channelId: data.channelId || null,
        categoryId: data.categoryId || null,
        supportRoleId: data.supportRoleId || null,
        logChannelId: data.logChannelId || null,
        embedTitle: data.embedTitle || null,
        embedDescription: data.embedDescription || null,
        embedColor: data.embedColor || null,
        buttonLabel: data.buttonLabel || null,
        buttonEmoji: data.buttonEmoji || null,
      }
    });
  };

  const values = form.watch();

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Tickets</h1>
          <p className="text-muted-foreground mt-2">Configura el canal donde se enviará el panel para abrir tickets. Usa <code className="bg-muted px-1 rounded">/setup-tickets</code> para enviar el panel.</p>
        </div>

        {isConfigLoading ? <Skeleton className="h-[600px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Configuración general</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Activar sistema de tickets</FormLabel>
                        <CardDescription>Habilita o deshabilita los tickets para este servidor.</CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="channelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal del panel de tickets</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="logChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de logs de tickets</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID de categoría para tickets</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="supportRoleId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del rol de soporte</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card>
                  <CardHeader><CardTitle>Configuración del embed</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="embedTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input placeholder="Sistema de Tickets" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Haz clic en el botón para abrir un ticket de soporte." className="min-h-[100px]" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="embedColor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" className="w-12 p-1" {...field} value={field.value || '#5865F2'} />
                              <Input placeholder="#5865F2" {...field} value={field.value || ''} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="buttonLabel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto del botón</FormLabel>
                          <FormControl><Input placeholder="Abrir Ticket" {...field} value={field.value || ''} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 sticky top-6">
                  <h3 className="font-medium text-sm text-muted-foreground">Vista previa</h3>
                  <DiscordEmbedPreview
                    title={values.embedTitle || "Sistema de Tickets"}
                    description={values.embedDescription || "Haz clic para abrir un ticket."}
                    color={values.embedColor || "#5865F2"}
                    buttonLabel={values.buttonLabel || "Abrir Ticket"}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateConfig.isPending}>
                  {updateConfig.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold tracking-tight">Tickets recientes</h2>
          <Card>
            <CardContent className="p-0">
              {isTicketsLoading ? (
                <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : tickets && tickets.length > 0 ? (
                <div className="divide-y divide-border">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.subject || `Ticket de ${ticket.username}`}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${ticket.status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                            {ticket.status === 'open' ? 'Abierto' : 'Cerrado'}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">Abierto por {ticket.username}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No hay tickets registrados.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
