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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { DiscordEmbedPreview } from "@/components/ui/DiscordEmbedPreview";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ticket, Sparkles } from "lucide-react";

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
        toast({ title: "✅ Guardado", description: "Configuración de tickets actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      enabled: false,
      channelId: "",
      categoryId: "",
      supportRoleId: "",
      logChannelId: "",
      embedTitle: "🎫 Sistema de Tickets",
      embedDescription: "¿Tienes alguna duda, problema o sugerencia?\n\nAbre un ticket y nuestro equipo de soporte te atenderá lo antes posible.",
      embedColor: "#FEE75C",
      buttonLabel: "Abrir Ticket",
      buttonEmoji: "🎫",
    }
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
  const openCount = tickets?.filter(t => t.status === 'open').length ?? 0;
  const totalCount = tickets?.length ?? 0;

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Sistema de Tickets</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Usa <code className="bg-muted px-1 rounded text-xs">/setup-tickets</code> para enviar el panel
              </p>
            </div>
          </div>
          {!isTicketsLoading && totalCount > 0 && (
            <div className="flex gap-2 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-lg font-bold text-green-400">{openCount}</p>
                <p className="text-[10px] text-muted-foreground">Abiertos</p>
              </div>
              <div className="text-center px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                <p className="text-lg font-bold">{totalCount}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          )}
        </div>

        {isConfigLoading ? <Skeleton className="h-[500px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Enable */}
              <Card>
                <CardContent className="p-4">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 space-y-0">
                      <div>
                        <FormLabel className="font-medium">Activar sistema de tickets</FormLabel>
                        <CardDescription className="text-xs mt-0.5">Habilita o deshabilita los tickets para este servidor.</CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Channel config */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Configuración de canales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="channelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal del panel</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="logChannelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de logs</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID de categoría</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormDescription className="text-xs">Donde se crearán los canales de ticket</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="supportRoleId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del rol de soporte</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormDescription className="text-xs">Puede ver y responder tickets</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              {/* Embed config + preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Embed del panel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="embedTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="Sistema de Tickets" {...field} value={field.value || ''} />
                          <EmojiPicker guildId={guildId} onSelect={(e) => field.onChange((field.value || '') + e)} />
                        </div>
                      </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Haz clic en el botón para abrir un ticket de soporte." className="min-h-[80px] resize-none" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="embedColor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <div className="w-9 h-9 rounded-lg border border-border shrink-0 relative overflow-hidden" style={{ background: field.value || '#5865F2' }}>
                                <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={field.value || '#5865F2'} onChange={e => field.onChange(e.target.value)} />
                              </div>
                              <Input placeholder="#5865F2" {...field} value={field.value || ''} className="font-mono text-xs" />
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

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-1">Vista previa</p>
                  <DiscordEmbedPreview
                    title={values.embedTitle || "🎫 Sistema de Tickets"}
                    description={values.embedDescription || "¿Tienes alguna duda, problema o sugerencia?\n\nAbre un ticket y nuestro equipo te atenderá."}
                    color={values.embedColor || "#FEE75C"}
                    buttonLabel={values.buttonLabel || "Abrir Ticket"}
                    buttonEmoji={values.buttonEmoji || "🎫"}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateConfig.isPending} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  {updateConfig.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Tickets list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Tickets recientes</h2>
          </div>
          <Card className="overflow-hidden">
            {isTicketsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="divide-y divide-border">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${ticket.status === 'open' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">Ticket #{ticket.id}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            ticket.status === 'open'
                              ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                              : 'bg-muted/50 text-muted-foreground border border-border'
                          }`}>
                            {ticket.status === 'open' ? 'Abierto' : 'Cerrado'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{ticket.userId}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {ticket.createdAt ? format(new Date(ticket.createdAt as string), 'dd/MM/yy HH:mm') : '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-6 h-6 text-muted-foreground opacity-40" />
                </div>
                <p className="text-sm font-medium">Sin tickets aún</p>
                <p className="text-xs text-muted-foreground mt-1">Los tickets creados en Discord aparecerán aquí.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
