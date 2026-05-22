import { useState } from "react";
  import { SmilePlus, Search, Loader2 } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
  import { useGuildEmojis } from "@/hooks/useGuildEmojis";

  interface EmojiPickerProps {
    guildId: string | undefined;
    /** Called with ":emoji_name:" when user clicks an emoji */
    onSelect: (emojiStr: string) => void;
    disabled?: boolean;
  }

  export function EmojiPicker({ guildId, onSelect, disabled }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { data: emojis, isLoading } = useGuildEmojis(guildId);

    const filtered = (emojis ?? []).filter(
      (e) => !search || e.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={disabled || !guildId}
            title="Insertar emoji del servidor"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Emojis del servidor</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar emoji..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-48">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-xs text-muted-foreground text-center px-4">
                    {(emojis?.length ?? 0) === 0
                      ? "Este servidor no tiene emojis personalizados."
                      : "No se encontraron emojis."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 p-1">
                  <TooltipProvider delayDuration={300}>
                    {filtered.map((emoji) => (
                      <Tooltip key={emoji.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="w-8 h-8 rounded hover:bg-muted flex items-center justify-center transition-colors"
                            onClick={() => {
                              onSelect(`:${emoji.name}:`);
                              setSearch("");
                              setOpen(false);
                            }}
                          >
                            <img
                              src={emoji.url}
                              alt={emoji.name}
                              className="w-6 h-6 object-contain"
                              loading="lazy"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          :{emoji.name}:
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  