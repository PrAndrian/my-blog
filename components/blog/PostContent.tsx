"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Doc } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface PostContentProps {
  post: Doc<"posts"> | null;
}

export function PostContent({ post }: PostContentProps) {
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

  return (
    <ScrollArea className="h-full bg-background">
      <article className="mx-auto max-w-4xl px-6 py-8">
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
        {post.featuredImageUrl && (
          <div className="mb-8">
            <img
              src={post.featuredImageUrl}
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
