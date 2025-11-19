"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { usePagination } from "@/hooks/usePagination";
import { ANIMATION, PAGINATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { PostListSkeleton } from "./PostListSkeleton";
import { TagFilter } from "./TagFilter";

interface PostListProps {
  posts: Doc<"posts">[] | undefined;
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
  const selectedPostRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("PostList");
  const format = useFormatter();

  // Extract available tags with counts from posts
  const availableTags = useMemo(() => {
    if (!posts) return [];
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

  // Filter and sort posts based on selected tags (OR logic)
  // Sort by date descending (latest first)
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    let result = posts;

    // Filter by tags if any are selected
    if (selectedTags.length > 0) {
      result = posts.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      );
    }

    // Sort by date descending (latest first)
    return [...result].sort((a, b) => b.date - a.date);
  }, [posts, selectedTags]);

  const { paginatedItems, currentPage, totalPages, setCurrentPage } =
    usePagination(filteredPosts ?? [], PAGINATION.ITEMS_PER_PAGE);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // Scroll selected post into view with GSAP
  useEffect(() => {
    if (selectedPostId && selectedPostRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (scrollContainer && selectedPostRef.current) {
        const postTop = selectedPostRef.current.offsetTop;
        const animation = gsap.to(scrollContainer, {
          scrollTop: postTop - 20,
          duration: ANIMATION.DURATION_LONG,
          ease: "power2.out",
        });
        return () => {
          animation.kill();
        };
      }
    }
  }, [selectedPostId]);

  // Animate post cards with GSAP
  useEffect(() => {
    if (postsContainerRef.current && paginatedItems.length > 0) {
      const cards =
        postsContainerRef.current.querySelectorAll("[data-post-card]");

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      const animation = gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.DURATION_SHORT,
          ease: "power2.out",
          stagger: 0.05,
        }
      );

      return () => {
        animation.kill();
      };
    }
  }, [paginatedItems]);

  // Handle keyboard navigation on post cards
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    postId: Id<"posts">
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectPost(postId);
    }
  };

  if (posts === undefined) {
    return (
      <div className="flex h-[calc(100%-1rem)] flex-col border-r bg-background my-2 mr-2 border-y rounded-r-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {category} {t("posts")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <PostListSkeleton />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100%-1rem)] flex-col border-r bg-background my-2 mr-2 border-y rounded-r-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {category} {t("posts")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedTags.length > 0 && filteredPosts
                ? `${filteredPosts.length} of ${posts.length}`
                : posts.length}{" "}
              {posts.length === 1 ? t("article") : t("articles")}
              {totalPages > 1 &&
                ` (${t("pageOf", { current: currentPage, total: totalPages })})`}
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
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-2 p-4" ref={postsContainerRef}>
          {filteredPosts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                {selectedTags.length > 0
                  ? t("noPostsMatch")
                  : t("noPostsInCategory")}
              </p>
            </div>
          ) : (
            <>
              {paginatedItems.map((post, index) => (
                <Card
                  key={post._id}
                  ref={selectedPostId === post._id ? selectedPostRef : null}
                  data-post-id={post._id}
                  data-post-card
                  data-first-post={index === 0 ? "true" : undefined}
                  tabIndex={0}
                  role="button"
                  aria-label={`${post.title}. ${t("posts")} ${format.dateTime(
                    post.date,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}. ${post.tags?.length || 0} tags.`}
                  aria-pressed={selectedPostId === post._id}
                  className={cn(
                    "cursor-pointer p-4 transition-all duration-200 ease-out",
                    "hover:bg-accent hover:shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedPostId === post._id
                      ? "border-primary bg-accent shadow-sm"
                      : "border-transparent"
                  )}
                  onClick={() => onSelectPost(post._id)}
                  onKeyDown={(e) => handleKeyDown(e, post._id)}
                >
                  <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>
                      {format.dateTime(post.date, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
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
              ))}
              {totalPages > 1 && (
                <div className="pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
