import { useParams } from "wouter";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  useGetWelcomeConfig,
  getGetWelcomeConfigQueryKey,
  useUpdateWelcomeConfig,
  useTestWelcomeEmbed,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { DiscordEmbedPreview } from "@/components/ui/DiscordEmbedPreview";
import { ChannelSelect } from "@/components/ui/ChannelSelect";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, Send, Settings, MessageSquare, Eye, Palette, Sparkles } from "lucide-react";

const PRESETS = [
  {
    label: "Clásico",
    color: "#5865F2",
    embedTitle: "¡Bienvenido/a, {user}!",
    embedDescription: "Nos alegra tenerte en **{server}**.\n\nYa somos **{memberCount}** miembros. ¡Esperamos que disfrutes tu estancia!",
    embedFooter: "¡Lee las reglas para una buena experiencia!",
  },
  {
    label: "Minimalista",
    color: "#57F287",
    embedTitle: "{user} se ha unido",
    embedDescription: "Bienvenido/a a {server} · {memberCount} miembros",
    embedFooter: undefined,
  },
  {
    label: "Épico",
    color: "#FEE75C",
    embedTitle: "🎉 ¡Un nuevo héroe llega!",
    embedDescription: "**{user}** ha entrado a la batalla.\n\n¡{server} te da la bienvenida! Ya somos **{memberCount}** guerreros.",
    embedFooter: "¡Consulta los canales de información!",
  },
];

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
  embedThumbnail: z.string().nullable().optional(),
  embedAuthorName: z.string().nullable().optional(),
  embedFooter: z.string().nullable().optional(),
});

type WelcomeFormValues = z.infer<typeof welcomeSchema>;

const PLACEHOLDERS = [
  { key: "{user}", desc: "Menciona al usuario" },
  { key: "{username}", desc: "Nombre del usuario" },
  { key: "{server}", desc: "Nombre del servidor" },
  { key: "{memberCount}", desc: "Nº de miembros" },
];

export default function WelcomeConfig() {
  const { guildId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"config" | "embed" | "preview">("config");

  const { data: config, isLoading } = useGetWelcomeConfig(guildId!, {
    query: { enabled: !!guildId, queryKey: getGetWelcomeConfigQueryKey(guildId!) },
  });

  const updateConfig = useUpdateWelcomeConfig({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetWelcomeConfigQueryKey(guildId!), data);
        toast({ title: "✅ Guardado", description: "La configuración de bienvenida fue actualizada." });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
    },
  });

  const testEmbed = useTestWelcomeEmbed({
    mutation: {
      onSuccess: (data) => {
        if (data.ok) {
          toast({ title: "📨 Enviado", description: data.message ?? "Embed de prueba enviado al canal." });
        } else {
          toast({ title: "Error", description: data.message ?? "No se pudo enviar.", variant: "destructive" });
        }
      },
      onError: () => toast({ title: "Error", description: "Fallo al enviar el embed de prueba.", variant: "destructive" }),
    },
  });

  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      enabled: false,
      channelId: "",
      autoRoleId: "",
      dmEnabled: false,
      dmMessage: "",
      embedTitle: "",
      embedDescription: "",
      embedColor: "#5865F2",
      embedImage: "",
      embedThumbnail: "",
      embedAuthorName: "",
      embedFooter: "",
    },
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
        embedThumbnail: config.embedThumbnail ?? "",
        embedAuthorName: config.embedAuthorName ?? "",
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
        embedThumbnail: data.embedThumbnail || null,
        embedAuthorName: data.embedAuthorName || null,
        embedFooter: data.embedFooter || null,
      },
    });
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    form.setValue("embedTitle", preset.embedTitle);
    form.setValue("embedDescription", preset.embedDescription);
    form.setValue("embedColor", preset.color);
    if (preset.embedFooter !== undefined) form.setValue("embedFooter", preset.embedFooter);
    setActiveTab("embed");
  };

  const values = form.watch();
  const tabs = [
    { id: "config", label: "General", icon: Settings },
    { id: "embed", label: "Embed", icon: Palette },
    { id: "preview", label: "Vista previa", icon: Eye },
  ] as const;

  return (
    <SidebarLayout guildId={guildId}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Bienvenida</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Envía un embed cuando alguien entra al servidor
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={testEmbed.isPending || !values.channelId}
                onClick={() => testEmbed.mutate({ guildId: guildId! })}
              >
                <Send className="w-4 h-4" />
                {testEmbed.isPending ? "Enviando..." : "Enviar prueba"}
              </Button>
              <Button type="submit" size="sm" disabled={updateConfig.isPending} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {updateConfig.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Enable toggle card */}
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div>
                          <FormLabel className="text-base font-medium">Activar sistema de bienvenida</FormLabel>
                          <FormDescription className="text-sm text-muted-foreground mt-0.5">
                            El embed se enviará cada vez que alguien entre al servidor
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-muted/40 rounded-lg border border-border w-fit">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === id
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab: General */}
              {activeTab === "config" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Configuración del canal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="channelId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Canal de bienvenida</FormLabel>
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
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="autoRoleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID del rol automático</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123456789012345678"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>Se asigna al usuario al entrar</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Mensaje directo (DM)
                      </CardTitle>
                      <CardDescription>Envía un mensaje privado al usuario cuando entra</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="dmEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3 border-border">
                            <div>
                              <FormLabel className="font-medium">Enviar DM al entrar</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {values.dmEnabled && (
                        <FormField
                          control={form.control}
                          name="dmMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contenido del DM</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="¡Bienvenido/a a {server}! No olvides leer las reglas."
                                  className="min-h-[90px] resize-none"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Placeholders reference */}
                  <Card className="bg-muted/20 border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Variables disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {PLACEHOLDERS.map((p) => (
                          <div key={p.key} className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs">
                            <code className="text-primary font-mono font-semibold">{p.key}</code>
                            <span className="text-muted-foreground">{p.desc}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab: Embed */}
              {activeTab === "embed" && (
                <div className="space-y-4">
                  {/* Presets */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Plantillas rápidas</CardTitle>
                      <CardDescription>Aplica un estilo predefinido como punto de partida</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="group relative rounded-lg border border-border bg-card hover:border-primary/50 transition-all p-3 text-left overflow-hidden"
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                              style={{ background: preset.color }}
                            />
                            <div className="pl-2">
                              <div className="font-semibold text-sm">{preset.label}</div>
                              <div className="text-muted-foreground text-xs mt-0.5 truncate">{preset.embedTitle}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Embed fields */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Contenido del embed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="embedAuthorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autor (pequeño texto arriba del título)</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                              <Input placeholder="Ej: {server} · Bienvenida" {...field} value={field.value || ""} />
                              <EmojiPicker guildId={guildId} onSelect={(e) => field.onChange((field.value || '') + e)} />
                            </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="embedTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                              <Input placeholder="¡Bienvenido/a, {user}!" {...field} value={field.value || ""} />
                              <EmojiPicker guildId={guildId} onSelect={(e) => field.onChange((field.value || '') + e)} />
                            </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="embedDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nos alegra tenerte en **{server}**. Ya somos **{memberCount}** miembros."
                                className="min-h-[100px] resize-y"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>Puedes usar **negrita**, *cursiva* y saltos de línea</FormDescription>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="embedColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color de la barra lateral</FormLabel>
                              <FormControl>
                                <div className="flex gap-2 items-center">
                                  <div
                                    className="w-10 h-10 rounded-lg border border-border shrink-0 cursor-pointer relative overflow-hidden"
                                    style={{ background: field.value || "#5865F2" }}
                                  >
                                    <input
                                      type="color"
                                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                      value={field.value || "#5865F2"}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </div>
                                  <Input
                                    placeholder="#5865F2"
                                    {...field}
                                    value={field.value || ""}
                                    className="font-mono"
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="embedFooter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pie de embed</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Lee las reglas del servidor"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="embedThumbnail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Miniatura (esquina derecha)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://ejemplo.com/imagen.png"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>Imagen pequeña a la derecha del texto</FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="embedImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Imagen grande</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://ejemplo.com/banner.png"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>Imagen a tamaño completo debajo del texto</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab: Preview */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Previsualización en Discord
                      </CardTitle>
                      <CardDescription>Así se verá el mensaje cuando alguien entre al servidor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DiscordEmbedPreview
                        authorName={values.embedAuthorName || undefined}
                        title={values.embedTitle || undefined}
                        description={values.embedDescription || undefined}
                        color={values.embedColor || "#5865F2"}
                        thumbnail={values.embedThumbnail || undefined}
                        image={values.embedImage || undefined}
                        footer={values.embedFooter || undefined}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20 border-dashed">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Haz clic en <strong>Enviar prueba</strong> (arriba) para ver el embed real en Discord con los placeholders sustituidos.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </SidebarLayout>
  );
}
