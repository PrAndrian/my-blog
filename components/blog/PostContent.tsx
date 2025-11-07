"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

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
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
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
    ? post.featuredImageUrl  // It's already a full URL
    : imageUrl;               // It's a storage ID, use the converted URL

  return (
    <ScrollArea className="h-full bg-background">
      <article ref={articleRef} className="mx-auto max-w-4xl px-6 py-8">
        {/* Post header */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{post.title}</h1>

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
            <img
              src={displayImageUrl}
              alt={post.title}
              className="h-auto w-full rounded-lg object-cover"
              style={{ maxHeight: "500px" }}
            />
          </div>
        )}

        {/* Post content - Markdown rendered */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </ScrollArea>
  );
}
