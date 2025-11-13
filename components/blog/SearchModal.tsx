"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar, FileText, Search, Tag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPost?: (postId: string, category: string) => void;
}

export function SearchModal({
  open,
  onOpenChange,
  onSelectPost,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const searchResults = useQuery(
    api.posts.searchPosts,
    searchQuery.trim().length > 0 ? { query: searchQuery.trim() } : "skip"
  );

  const handlePostClick = useCallback(
    (post: {
      _id: Id<"posts">;
      slug: string;
      category: string;
    }) => {
      onOpenChange(false);
      setSearchQuery("");
      
      if (onSelectPost) {
        // Use the provided handler (integrated with page navigation)
        onSelectPost(post._id, post.category);
      } else {
        // Fallback: Navigate to the post with category and post ID in URL
        const url = `/?category=${encodeURIComponent(post.category)}&post=${post._id}`;
        router.push(url);
      }
    },
    [onSelectPost, router, onOpenChange]
  );

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = document.querySelector(
          '[data-search-input]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const displayResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults;
  }, [searchResults]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Search Posts</DialogTitle>
          <DialogDescription>
            Search by title, tags, category, author, or content
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-search-input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          {!searchQuery.trim() ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search posts...</p>
            </div>
          ) : searchResults === undefined ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Searching...</p>
            </div>
          ) : displayResults.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="py-4 space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Found {displayResults.length} result
                {displayResults.length !== 1 ? "s" : ""}
              </p>
              {displayResults.map((post) => (
                <Button
                  key={post._id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 text-left hover:bg-accent"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.authorName || post.author}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{post.category}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(post.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

