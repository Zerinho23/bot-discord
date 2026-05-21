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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DiscordEmbedPreview } from "@/components/ui/DiscordEmbedPreview";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
        toast({ title: "Guardado", description: "Configuración de verificación actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    }
  });

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { enabled: false, channelId: "", roleId: "", embedTitle: "", embedDescription: "", embedColor: "#5865F2", buttonLabel: "", buttonEmoji: "" }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verificación</h1>
          <p className="text-muted-foreground mt-2">
            El bot enviará un código por DM al usuario cuando presione el botón. El usuario debe escribir el código en el servidor para obtener el rol.
          </p>
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
                        <FormLabel className="text-base">Activar verificación</FormLabel>
                        <CardDescription>Habilita o deshabilita el sistema de verificación.</CardDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormControl><Input placeholder="Verificación" {...field} value={field.value || ''} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="embedDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Presiona el botón para verificarte y acceder al servidor." className="min-h-[100px]" {...field} value={field.value || ''} />
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
                          <FormControl><Input placeholder="Verificar" {...field} value={field.value || ''} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 sticky top-6">
                  <h3 className="font-medium text-sm text-muted-foreground">Vista previa</h3>
                  <DiscordEmbedPreview
                    title={values.embedTitle || "Verificación"}
                    description={values.embedDescription || "Presiona el botón para verificarte."}
                    color={values.embedColor || "#5865F2"}
                    buttonLabel={values.buttonLabel || "Verificar"}
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
