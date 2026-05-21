import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useGetVerificationConfig, getGetVerificationConfigQueryKey, useUpdateVerificationConfig } from "@workspace/api-client-react";
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
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, Sparkles } from "lucide-react";

const verificationSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().nullable().optional(),
  roleId: z.string().nullable().optional(),
  embedTitle: z.string().nullable().optional(),
  embedDescription: z.string().nullable().optional(),
  embedColor: z.string().nullable().optional(),
  buttonLabel: z.string().nullable().optional(),
  buttonEmoji: z.string().nullable().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function VerificationConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useGetVerificationConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetVerificationConfigQueryKey(guildId!) }
  });

  const updateConfig = useUpdateVerificationConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetVerificationConfigQueryKey(guildId!), data);
        toast({ title: "✅ Guardado", description: "Configuración de verificación actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      enabled: false, channelId: "", roleId: "", embedTitle: "",
      embedDescription: "", embedColor: "#5865F2", buttonLabel: "", buttonEmoji: ""
    }
  });

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled ?? false,
        channelId: config.channelId ?? "",
        roleId: config.roleId ?? "",
        embedTitle: config.embedTitle ?? "",
        embedDescription: config.embedDescription ?? "",
        embedColor: config.embedColor ?? "#5865F2",
        buttonLabel: config.buttonLabel ?? "",
        buttonEmoji: config.buttonEmoji ?? "",
      });
    }
  }, [config, form]);

  const onSubmit = (data: VerificationFormValues) => {
    updateConfig.mutate({
      guildId: guildId!,
      data: {
        enabled: data.enabled,
        channelId: data.channelId || null,
        roleId: data.roleId || null,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Verificación</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              El bot envía un código en el canal de verificación — el usuario lo escribe ahí mismo para obtener el rol.
            </p>
          </div>
        </div>

        {isLoading ? <Skeleton className="h-[550px] w-full" /> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Enable toggle */}
              <Card>
                <CardContent className="p-4">
                  <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 space-y-0">
                      <div>
                        <FormLabel className="font-medium">Activar verificación</FormLabel>
                        <CardDescription className="text-xs mt-0.5">Habilita o deshabilita el sistema de verificación.</CardDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Channel & Role */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Canal y rol</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="channelId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal de verificación</FormLabel>
                        <FormControl>
                          <ChannelSelect
                            guildId={guildId}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Seleccionar canal..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="roleId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del rol verificado</FormLabel>
                        <FormControl>
                          <Input placeholder="1434712129654493244" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription className="text-xs">Se asigna al verificarse</FormDescription>
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
                    <CardTitle className="text-base">Configuración del embed</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="embedTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input placeholder="Verificación" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Presiona el botón para verificarte y acceder al servidor."
                            className="min-h-[80px] resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="embedColor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <div
                                className="w-9 h-9 rounded-lg border border-border shrink-0 relative overflow-hidden"
                                style={{ background: field.value || '#5865F2' }}
                              >
                                <input
                                  type="color"
                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  value={field.value || '#5865F2'}
                                  onChange={e => field.onChange(e.target.value)}
                                />
                              </div>
                              <Input placeholder="#5865F2" {...field} value={field.value || ''} className="font-mono text-xs" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="buttonLabel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto del botón</FormLabel>
                          <FormControl><Input placeholder="Verificar" {...field} value={field.value || ''} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-1">Vista previa</p>
                  <DiscordEmbedPreview
                    title={values.embedTitle || "Verificación"}
                    description={values.embedDescription || "Presiona el botón para verificarte."}
                    color={values.embedColor || "#5865F2"}
                    buttonLabel={values.buttonLabel || "Verificar"}
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
      </div>
    </SidebarLayout>
  );
}
