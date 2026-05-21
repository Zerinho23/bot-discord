import React from "react";
import { Card } from "@/components/ui/card";

interface EmbedPreviewProps {
  title?: string;
  description?: string;
  color?: string;
  buttonLabel?: string;
  image?: string;
  footer?: string;
}

export function DiscordEmbedPreview({ title, description, color, buttonLabel, image, footer }: EmbedPreviewProps) {
  // Convert color to hex if needed, assuming it might be provided as #hex or integer
  const embedColor = color?.startsWith("#") ? color : color ? `#${parseInt(color).toString(16).padStart(6, '0')}` : "#2b2d31";

  return (
    <div className="bg-[#313338] rounded-md p-4 w-full text-[#dbdee1] font-sans text-sm flex gap-4 max-w-lg shadow-lg">
      <div className="shrink-0 pt-1">
        <div className="w-10 h-10 rounded-full bg-[#1e1f22] flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">BOT</div>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white">BotName</span>
          <span className="text-[10px] bg-[#5865F2] text-white px-1 rounded rounded-sm leading-4">BOT</span>
          <span className="text-xs text-[#949ba4]">Today at 12:00 PM</span>
        </div>
        
        <div className="mt-1 bg-[#2b2d31] rounded-[4px] border-l-4 overflow-hidden relative" style={{ borderLeftColor: embedColor }}>
          <div className="p-3 flex flex-col gap-2">
            {title && (
              <div className="font-semibold text-white text-[15px]">{title}</div>
            )}
            
            {description && (
              <div className="text-[14px] whitespace-pre-wrap leading-tight opacity-90 break-words">
                {description}
              </div>
            )}
            
            {image && (
              <div className="mt-2 rounded overflow-hidden max-w-sm">
                <img src={image} alt="Embed" className="max-w-full h-auto object-cover max-h-[300px]" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            {footer && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[#949ba4]">
                <div className="w-5 h-5 rounded-full bg-[#1e1f22] overflow-hidden shrink-0"></div>
                <span className="truncate">{footer}</span>
              </div>
            )}
            
            {!title && !description && !image && !footer && (
              <div className="text-[14px] italic opacity-50">Empty embed</div>
            )}
          </div>
        </div>

        {buttonLabel && (
          <div className="mt-2 flex">
            <button className="bg-[#4e5058] hover:bg-[#6d6f78] text-white px-4 py-[6px] rounded-[3px] text-[14px] font-medium transition-colors">
              {buttonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}