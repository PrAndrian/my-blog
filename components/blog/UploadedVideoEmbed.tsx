"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UploadedVideoEmbedProps {
  storageId: string;
}

/**
 * UploadedVideoEmbed component renders uploaded videos from Convex storage
 * Used by PostContent when rendering blog posts with video embeds
 */
export function UploadedVideoEmbed({ storageId }: UploadedVideoEmbedProps) {
  // Fetch video URL from Convex storage
  const videoUrl = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip"
  );

  if (!videoUrl) {
    return (
      <div
        className="video-embed-wrapper my-6"
        style={{
          position: "relative",
          paddingBottom: "56.25%", // 16:9 aspect ratio
          height: 0,
          overflow: "hidden",
          maxWidth: "100%",
          borderRadius: "0.5rem",
          backgroundColor: "var(--muted)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--muted-foreground)",
          }}
        >
          Loading video...
        </div>
      </div>
    );
  }

  return (
    <div
      className="video-embed-wrapper my-6"
      style={{
        position: "relative",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 0,
        overflow: "hidden",
        maxWidth: "100%",
        borderRadius: "0.5rem",
      }}
    >
      <video
        src={videoUrl}
        controls
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        title={`Uploaded video ${storageId}`}
      />
    </div>
  );
}
