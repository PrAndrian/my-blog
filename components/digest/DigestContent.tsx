"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { ExternalLink } from "lucide-react";

interface DigestContentProps {
  digest: Doc<"digests"> | null;
}

export function DigestContent({ digest }: DigestContentProps) {
  if (!digest) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Select a digest to read
          </p>
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
        {/* Digest header */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {digest.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(digest.date)}</span>
            <span>•</span>
            <Badge variant="secondary">
              {digest.articles.length} articles
            </Badge>
          </div>

          {/* Tags */}
          {digest.tags && digest.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {digest.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Summary */}
          <p className="mt-4 text-lg text-muted-foreground">
            {digest.summary}
          </p>
        </header>

        <Separator className="mb-8" />

        {/* Featured Articles */}
        {digest.articles && digest.articles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Articles</h2>
            <div className="space-y-4">
              {digest.articles.map((article, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {article.source}
                      </p>
                      <p className="text-sm mb-3">{article.summary}</p>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        Read more
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-8" />

        {/* Digest content - Markdown rendered */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {digest.content}
          </ReactMarkdown>
        </div>
      </article>
    </ScrollArea>
  );
}
