"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface PostListProps {
  posts: Doc<"posts">[];
  selectedPostId: Id<"posts"> | null;
  onSelectPost: (postId: Id<"posts">) => void;
  category: string;
}

export function PostList({ posts, selectedPostId, onSelectPost, category }: PostListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{category} Posts</h2>
        <p className="text-sm text-muted-foreground">
          {posts.length} {posts.length === 1 ? "article" : "articles"}
        </p>
      </div>

      <Separator />

      {/* Posts list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {posts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No posts in this category yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card
                key={post._id}
                className={`cursor-pointer p-4 transition-colors hover:bg-accent ${
                  selectedPostId === post._id ? "border-primary bg-accent" : ""
                }`}
                onClick={() => onSelectPost(post._id)}
              >
                <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">{post.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(post.date)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
