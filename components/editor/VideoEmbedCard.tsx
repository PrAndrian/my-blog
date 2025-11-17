"use client";

import { useState } from "react";
import { Play, MoreVertical, Trash2, Copy, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { showSuccess } from "@/lib/toast";

interface VideoEmbedCardProps {
  storageId: string;
  onDelete: () => void;
}

export function VideoEmbedCard({ storageId, onDelete }: VideoEmbedCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch video URL from Convex storage
  const videoUrl = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip"
  );

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(`[video:${storageId}]`);
      showSuccess("Video reference copied to clipboard");
    } catch (error) {
      console.error("Failed to copy reference:", error);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <>
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
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyReference}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Reference
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Video Preview */}
        {videoUrl ? (
          <div
            className="relative aspect-video w-full bg-muted cursor-pointer"
            onClick={handlePreview}
          >
            <video src={videoUrl} className="w-full h-full object-cover" />

            {/* Play Button Overlay - Notion style */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/70 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground">Loading video...</div>
          </div>
        )}

        {/* Video Info */}
        <div className="p-3 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Video Icon */}
            <svg
              className="h-5 w-5 flex-shrink-0 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>

            {/* Video Title/ID */}
            <span className="text-sm text-muted-foreground truncate">
              Uploaded Video
            </span>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {videoUrl && (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
