import { useQuery } from "@tanstack/react-query";

  export interface GuildEmoji {
    id: string;
    name: string;
    animated: boolean;
    url: string;
  }

  export function useGuildEmojis(guildId: string | undefined) {
    return useQuery<GuildEmoji[]>({
      queryKey: ["guild-emojis", guildId],
      queryFn: async () => {
        const res = await fetch(`/api/guilds/${guildId}/emojis`, { credentials: "include" });
        if (!res.ok) return [];
        return res.json();
      },
      enabled: !!guildId,
      staleTime: 5 * 60 * 1000,
    });
  }
  