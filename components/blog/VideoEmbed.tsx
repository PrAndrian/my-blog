"use client";

import React from "react";

interface VideoEmbedProps {
  videoId: string;
}

/**
 * VideoEmbed component renders YouTube videos as responsive iframes
 * Used by PostContent when rendering blog posts with video embeds
 */
export function VideoEmbed({ videoId }: VideoEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId.trim()}`;

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
      <iframe
        src={embedUrl}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={`YouTube video ${videoId}`}
      />
    </div>
  );
}
