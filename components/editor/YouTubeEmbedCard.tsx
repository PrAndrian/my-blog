"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreVertical, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface YouTubeEmbedCardProps {
  videoId: string;
  onDelete: () => void;
}

export function YouTubeEmbedCard({ videoId, onDelete }: YouTubeEmbedCardProps) {
  const [imageError, setImageError] = useState(false);

  // YouTube thumbnail URLs (try maxresdefault first, fallback to hqdefault)
  const thumbnailUrl = imageError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleOpenInYouTube = () => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div
      className="group relative my-4 rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
      contentEditable={false}
    >
      {/* Menu Button - Notion style (top-right, shows on hover) */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenInYouTube}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in YouTube
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail with Play Button Overlay */}
      <div
        className="relative aspect-video w-full bg-muted cursor-pointer"
        onClick={handleOpenInYouTube}
      >
        <Image
          fill
          src={thumbnailUrl}
          alt={`YouTube video ${videoId}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />

        {/* Play Button Overlay - Notion style */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/70 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* YouTube Icon */}
          <svg
            className="h-5 w-5 flex-shrink-0 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>

          {/* Video Title/ID */}
          <span className="text-sm text-muted-foreground truncate">
            YouTube Video
          </span>
        </div>
      </div>
    </div>
  );
}
