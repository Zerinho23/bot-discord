import { useState } from "react";
import { Check, ChevronsUpDown, Hash, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGuildChannels } from "@/hooks/useGuildChannels";

interface ChannelSelectProps {
  guildId: string | undefined;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChannelSelect({
  guildId,
  value,
  onChange,
  placeholder = "Seleccionar canal...",
  disabled,
}: ChannelSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: channels, isLoading } = useGuildChannels(guildId);

  const selected = channels?.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-background border-input hover:bg-muted/50"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando canales...
            </span>
          ) : selected ? (
            <span className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar canal..." />
          <CommandList>
            <CommandEmpty>No se encontraron canales.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground italic"
                >
                  <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                  Sin canal
                </CommandItem>
              )}
              {channels?.map((channel) => (
                <CommandItem
                  key={channel.id}
                  value={channel.name}
                  onSelect={() => {
                    onChange(channel.id === value ? null : channel.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === channel.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Hash className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
