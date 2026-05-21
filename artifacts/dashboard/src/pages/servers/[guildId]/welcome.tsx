import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetWelcomeConfig, getGetWelcomeConfigQueryKey, useUpdateWelcomeConfig } from "@workspace/api-client-react";
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

const welcomeSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().nullable().optional(),
  autoRoleId: z.string().nullable().optional(),
  dmEnabled: z.boolean().optional(),
  dmMessage: z.string().nullable().optional(),
  embedTitle: z.string().nullable().optional(),
  embedDescription: z.string().nullable().optional(),
  embedColor: z.string().nullable().optional(),
  embedImage: z.string().nullable().optional(),
  embedFooter: z.string().nullable().optional(),
});

type WelcomeFormValues = z.infer<typeof welcomeSchema>;

export default function WelcomeConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useGetWelcomeConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetWelcomeConfigQueryKey(guildId!) }
  });

  const updateConfig = useUpdateWelcomeConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetWelcomeConfigQueryKey(guildId!), data);
        toast({ title: "Guardado", description: "Configuración de bienvenida actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: { enabled: false, channelId: "", autoRoleId: "", dmEnabled: false, dmMessage: "", embedTitle: "", embedDescription: "", embedColor: "#5865F2", embedImage: "", embedFooter: "" }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled ?? false,
        channelId: config.channelId ?? "",
        autoRoleId: config.autoRoleId ?? "",
        dmEnabled: config.dmEnabled ?? false,
        dmMessage: config.dmMessage ?? "",
        embedTitle: config.embedTitle ?? "",
        embedDescription: config.embedDescription ?? "",
        embedColor: config.embedColor ?? "#5865F2",
        embedImage: config.embedImage ?? "",
        embedFooter: config.embedFooter ?? "",
      });
    }
  }, [config, form]);

  const onSubmit = (data: WelcomeFormValues) => {
    updateConfig.mutate({
      guildId: guildId!,
      data: {
        enabled: data.enabled,
        channelId: data.channelId || null,
        autoRoleId: data.autoRoleId || null,
        dmEnabled: data.dmEnabled,
        dmMessage: data.dmMessage || null,
        embedTitle: data.embedTitle || null,
        embedDescription: data.embedDescription || null,
        embedColor: data.embedColor || null,
        embedImage: data.embedImage || null,
        embedFooter: data.embedFooter || null,
      }
    });
  };

  const values = form.watch();

  return (
    <SidebarLayout guildId={guildId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenida</h1>
          <p className="text-muted-foreground mt-2">Cada vez que un usuario entre al servidor se enviará el embed al canal seleccionado.</p>
        </div>

        {isLoading ? <Skeleton className="h-[600px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Configuración general</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Activar bienvenida</FormLabel>
                        <CardDescription>Envía un embed cuando un usuario entra al servidor.</CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="channelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de bienvenida</FormLabel>
                        <FormControl>
                          <ChannelSelect guildId={guildId} value={field.value} onChange={field.onChange} placeholder="Seleccionar canal..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="autoRoleId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del rol automático al entrar</FormLabel>
                        <FormControl><Input placeholder="123456789012345678" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Mensaje directo al entrar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="dmEnabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enviar DM al entrar</FormLabel>
                        <CardDescription>Envía un mensaje privado al usuario cuando entra.</CardDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  {values.dmEnabled && (
                    <FormField control={form.control} name="dmMessage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido del DM</FormLabel>
                        <FormControl>
                          <Textarea placeholder="¡Bienvenido a {server}! Lee las reglas." className="min-h-[80px]" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )} />
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card>
                  <CardHeader><CardTitle>Configuración del embed</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="embedTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input placeholder="¡Bienvenido {user}!" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="¡Nos alegra tenerte aquí en {server}! Ya somos {memberCount} miembros." className="min-h-[100px]" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedFooter" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pie de embed</FormLabel>
                        <FormControl><Input placeholder="Lee las reglas del servidor" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedImage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de imagen</FormLabel>
                        <FormControl><Input placeholder="https://ejemplo.com/imagen.png" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
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
                  </CardContent>
                </Card>

                <div className="space-y-4 sticky top-6">
                  <h3 className="font-medium text-sm text-muted-foreground">Vista previa</h3>
                  <DiscordEmbedPreview
                    title={values.embedTitle || "¡Bienvenido!"}
                    description={values.embedDescription || "Nos alegra tenerte aquí."}
                    color={values.embedColor || "#5865F2"}
                    image={values.embedImage || undefined}
                    footer={values.embedFooter || undefined}
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
      </div>
    </SidebarLayout>
  );
}
