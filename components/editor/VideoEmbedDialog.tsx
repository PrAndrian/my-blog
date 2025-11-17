"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VideoEmbedDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export function VideoEmbedDialog({
  open,
  onClose,
  onSubmit,
}: VideoEmbedDialogProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
      onClose();
    }
  };

  const handleClose = () => {
    setUrl("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Embed YouTube Video</DialogTitle>
            <DialogDescription>
              Enter the YouTube video URL you want to embed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Embed Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
