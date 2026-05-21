import { useQuery } from "@tanstack/react-query";

export interface GuildChannel {
  id: string;
  name: string;
  type: number;
}

export function useGuildChannels(guildId: string | undefined) {
  return useQuery<GuildChannel[]>({
    queryKey: ["guild-channels", guildId],
    queryFn: async () => {
      if (!guildId) return [];
      const res = await fetch(`/api/guilds/${guildId}/channels`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!guildId,
    staleTime: 30_000,
  });
}
