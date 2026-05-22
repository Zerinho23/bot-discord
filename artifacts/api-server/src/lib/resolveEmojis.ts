import type { Guild } from "discord.js";

  /**
   * Resolves :emoji_name: syntax to proper Discord custom emoji format.
   * Converts :name: → <:name:id> for static emojis and <a:name:id> for animated ones.
   * Skips matches that are already in the correct <:name:id> or <a:name:id> format.
   * Leaves unchanged any :name: that doesn't match a guild emoji.
   */
  export function resolveEmojis(text: string, guild: Guild): string {
    // Match :name: but NOT <:name:id> or <a:name:id> (already formatted)
    return text.replace(/(?<!<a?):(\w+):(?!\d*>)/g, (match, name) => {
      const emoji = guild.emojis.cache.find((e) => e.name === name);
      if (!emoji) return match;
      return emoji.animated
        ? `<a:${emoji.name}:${emoji.id}>`
        : `<:${emoji.name}:${emoji.id}>`;
    });
  }
  