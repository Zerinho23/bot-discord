import React from "react";

interface EmbedPreviewProps {
  authorName?: string;
  title?: string;
  description?: string;
  color?: string;
  thumbnail?: string;
  image?: string;
  footer?: string;
  botName?: string;
  botAvatar?: string;
  buttonLabel?: string;
}

export function DiscordEmbedPreview({
  authorName,
  title,
  description,
  color,
  thumbnail,
  image,
  footer,
  botName = "InfernBOT",
  botAvatar,
  buttonLabel,
}: EmbedPreviewProps) {
  const embedColor = color?.startsWith("#") ? color : color ? `#${parseInt(color).toString(16).padStart(6, "0")}` : "#5865F2";
  const hasContent = authorName || title || description || image || thumbnail || footer;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-[#313338] rounded-lg p-4 w-full font-['Whitney','Helvetica Neue',Helvetica,Arial,sans-serif] select-none">
      {/* Message row */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {botAvatar ? (
            <img src={botAvatar} alt={botName} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold">
              {botName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Username + badge + time */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-white font-semibold text-[15px] leading-none">{botName}</span>
            <span className="bg-[#5865F2] text-white text-[10px] font-semibold px-1 py-px rounded-sm leading-none uppercase tracking-wide">BOT</span>
            <span className="text-[#949ba4] text-xs leading-none ml-1">Hoy a las {timeStr}</span>
          </div>

          {/* Embed */}
          {hasContent ? (
            <div
              className="mt-2 rounded-[4px] overflow-hidden max-w-[432px]"
              style={{ background: "#2b2d31", borderLeft: `4px solid ${embedColor}` }}
            >
              <div className="p-3 pr-4">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Author */}
                    {authorName && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#5865F2] shrink-0" />
                        <span className="text-white text-xs font-medium leading-none truncate">{authorName}</span>
                      </div>
                    )}

                    {/* Title */}
                    {title && (
                      <div className="text-white font-semibold text-[15px] leading-snug">{title}</div>
                    )}

                    {/* Description */}
                    {description && (
                      <div className="text-[#dbdee1] text-sm leading-[1.375] whitespace-pre-wrap break-words opacity-90">
                        {description}
                      </div>
                    )}

                    {/* Large image */}
                    {image && (
                      <div className="mt-2 rounded overflow-hidden">
                        <img
                          src={image}
                          alt="embed"
                          className="max-w-full h-auto max-h-[300px] object-cover rounded"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}

                    {/* Footer */}
                    {footer && (
                      <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-white/5">
                        <div className="w-4 h-4 rounded-full bg-[#1e1f22] shrink-0" />
                        <span className="text-[#949ba4] text-[12px] leading-none truncate">{footer}</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  {thumbnail && (
                    <div className="shrink-0 ml-2">
                      <img
                        src={thumbnail}
                        alt="thumbnail"
                        className="w-16 h-16 rounded object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 bg-[#2b2d31] border-l-4 border-[#5865F2] rounded-[4px] p-3 max-w-[432px]">
              <span className="text-[#949ba4] text-sm italic">El embed aparecerá aquí...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
