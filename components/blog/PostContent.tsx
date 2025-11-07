"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { gsap } from "gsap";
import "highlight.js/styles/github-dark.css";
import Image from "next/image";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  post: Doc<"posts"> | null;
}

export function PostContent({ post }: PostContentProps) {
  const articleRef = useRef<HTMLElement>(null);

  // Convert Convex storage ID to URL if needed
  const imageUrl = useQuery(
    api.files.getFileUrl,
    post?.featuredImageUrl ? { storageId: post.featuredImageUrl } : "skip"
  );

  // Animate content fade-in with GSAP
  useEffect(() => {
    if (post && articleRef.current) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(articleRef.current, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        articleRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }
  }, [post]);

  if (!post) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Select a post to read</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Determine the actual image URL to display
  const displayImageUrl = post.featuredImageUrl?.startsWith("http")
    ? post.featuredImageUrl // It's already a full URL
    : imageUrl; // It's a storage ID, use the converted URL

  return (
    <ScrollArea className="h-full bg-background overflow-x-hidden">
      <div
        className="w-full max-w-full min-w-0 box-border"
        style={{ maxWidth: "100%" }}
      >
        <article
          ref={articleRef}
          className="mx-auto w-full max-w-full md:max-w-4xl min-w-0 px-4 md:px-6 py-8 box-border"
          style={{ maxWidth: "100%", width: "100%" }}
        >
          {/* Post header */}
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight break-words">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.author}</span>
              <span>•</span>
              <Badge variant="secondary">{post.category}</Badge>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator className="mb-8" />

          {/* Featured image */}
          {displayImageUrl && (
            <div className="mb-8">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-lg"
              >
                <Image
                  src={displayImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
              </AspectRatio>
            </div>
          )}

          {/* Post content - Markdown rendered */}
          <div className="prose prose-slate dark:prose-invert max-w-none md:max-w-none break-words w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img: ({ src, alt }) => {
                  if (!src) return null;
                  // Use regular img for data URLs or if src is not a valid URL
                  const isDataUrl = src.startsWith("data:");
                  const isValidUrl =
                    src.startsWith("http") || src.startsWith("/");

                  if (isDataUrl || !isValidUrl) {
                    return (
                      <div className="my-4">
                        <AspectRatio
                          ratio={16 / 9}
                          className="overflow-hidden rounded-lg"
                        >
                          <img
                            src={src}
                            alt={alt || ""}
                            className="h-full w-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    );
                  }

                  return (
                    <div className="my-4">
                      <AspectRatio
                        ratio={16 / 9}
                        className="overflow-hidden rounded-lg"
                      >
                        <Image
                          src={src}
                          alt={alt || ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                        />
                      </AspectRatio>
                    </div>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </ScrollArea>
  );
}
