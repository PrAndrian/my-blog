"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { TagFilter } from "./TagFilter";

interface PostListProps {
  posts: Doc<"posts">[];
  selectedPostId: Id<"posts"> | null;
  onSelectPost: (postId: Id<"posts">) => void;
  category: string;
}

export function PostList({
  posts,
  selectedPostId,
  onSelectPost,
  category,
}: PostListProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Extract available tags with counts from posts
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [posts]);

  // Filter posts based on selected tags (OR logic)
  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) {
      return posts;
    }
    return posts.filter((post) =>
      selectedTags.some((tag) => post.tags.includes(tag))
    );
  }, [posts, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="flex h-[calc(100%-1rem)] flex-col border-r bg-background my-2 mr-2 border-y rounded-r-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{category} Posts</h2>
            <p className="text-sm text-muted-foreground">
              {selectedTags.length > 0
                ? `${filteredPosts.length} of ${posts.length}`
                : posts.length}{" "}
              {posts.length === 1 ? "article" : "articles"}
            </p>
          </div>
          <TagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </div>
      </div>

      <Separator />

      {/* Posts list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {filteredPosts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                {selectedTags.length > 0
                  ? "No posts match the selected tags."
                  : "No posts in this category yet."}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post._id}
                className={`cursor-pointer p-4 transition-colors hover:bg-accent ${
                  selectedPostId === post._id ? "border-primary bg-accent" : ""
                }`}
                onClick={() => onSelectPost(post._id)}
              >
                <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{formatDate(post.date)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs ${
                          selectedTags.includes(tag)
                            ? "border-primary text-primary"
                            : ""
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
