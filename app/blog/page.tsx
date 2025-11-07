"use client";

import { BlogNavigationSidebar } from "@/components/blog/BlogNavigationSidebar";
import { PostContent } from "@/components/blog/PostContent";
import { PostList } from "@/components/blog/PostList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { gsap } from "gsap";
import { ArrowLeft, HelpCircle, Keyboard, Menu } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type MobilePanel = "navigation" | "postList" | "postContent";

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("Home");
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(
    null
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("postList");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string>("");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isNavigatingBack = useRef(false);
  const isManualPostSelection = useRef(false);
  const postListPanelRef = useRef<HTMLDivElement>(null);
  const homePanelRef = useRef<HTMLDivElement>(null);
  const postContentPanelRef = useRef<HTMLDivElement>(null);

  // Fetch categories and posts
  const categories = useQuery(api.posts.getCategories) ?? [];
  const posts =
    useQuery(
      api.posts.getPostsByCategory,
      selectedCategory !== "Home" ? { category: selectedCategory } : "skip"
    ) ?? [];

  // Get selected post
  const selectedPost =
    posts.find((post) => post._id === selectedPostId) ?? null;

  // Initialize from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const postParam = searchParams.get("post");

    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
      if (postParam) {
        setSelectedPostId(postParam as Id<"posts">);
        setMobilePanel("postContent");
      } else {
        setMobilePanel("postList");
      }
    } else if (postParam && !selectedPostId) {
      setSelectedPostId(postParam as Id<"posts">);
      setMobilePanel("postContent");
    }
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select latest post when URL has category but no post param (desktop only)
  useEffect(() => {
    // Don't auto-select on mobile
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      return;
    }

    const categoryParam = searchParams.get("category");
    const postParam = searchParams.get("post");

    if (
      categoryParam &&
      categoryParam !== "Home" &&
      !postParam &&
      posts &&
      posts.length > 0 &&
      !selectedPostId &&
      !isInitialMount.current
    ) {
      const latestPost = posts.reduce((latest, current) => {
        return current.date > latest.date ? current : latest;
      }, posts[0]);

      if (latestPost) {
        setSelectedPostId(latestPost._id);
        setMobilePanel("postContent");
      }
    }
  }, [searchParams, posts, selectedPostId]);

  // Sync state to URL
  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();
    if (selectedCategory !== "Home") {
      params.set("category", selectedCategory);
      if (selectedPostId) {
        params.set("post", selectedPostId);
      }
    }

    const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";

    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, selectedPostId, router]);

  // Handle category selection
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedPostId(null);
    setIsMenuOpen(false);
    setAnnouncement(`Navigated to ${category} category`);

    // On mobile, set the correct panel (no auto-select)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      setMobilePanel("postList");
    }
  }, []);

  // Auto-select latest post when category is selected (desktop only)
  useEffect(() => {
    // Don't auto-select if user manually selected a post or is navigating back
    if (isManualPostSelection.current || isNavigatingBack.current) {
      return;
    }

    // Don't auto-select on mobile (viewport width < 1024px)
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // On mobile, just ensure correct panel is shown
      // Don't override if a post is already selected (user clicked on a post)
      // or if we're already on postContent panel
      if (selectedPostId || mobilePanel === "postContent") {
        return;
      }
      if (selectedCategory !== "Home" && posts && posts.length > 0) {
        setMobilePanel("postList");
      } else if (selectedCategory === "Home") {
        setMobilePanel("postList");
      }
      return;
    }

    if (
      selectedCategory !== "Home" &&
      posts &&
      posts.length > 0 &&
      !selectedPostId &&
      !isInitialMount.current &&
      mobilePanel !== "postList" // Don't auto-select if user explicitly navigated to postList
    ) {
      // Sort posts by date descending (latest first) to ensure we get the most recent
      const sortedPosts = [...posts].sort((a, b) => b.date - a.date);
      const latestPost = sortedPosts[0];

      if (latestPost) {
        setSelectedPostId(latestPost._id);
        setMobilePanel("postContent");
        setAnnouncement(`Reading ${latestPost.title}`);
      }
    } else if (
      selectedCategory !== "Home" &&
      posts &&
      posts.length === 0 &&
      !isInitialMount.current
    ) {
      // If no posts, show post list panel
      setMobilePanel("postList");
    } else if (selectedCategory === "Home") {
      // If Home is selected, show home panel (mobile only, desktop doesn't use mobilePanel)
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setMobilePanel("postList");
      }
    }
  }, [selectedCategory, posts, selectedPostId, mobilePanel]);

  // Handle post selection
  const handleSelectPost = useCallback(
    (postId: Id<"posts">) => {
      isManualPostSelection.current = true;
      setSelectedPostId(postId);
      setMobilePanel("postContent");
      const post = posts.find((p) => p._id === postId);
      if (post) {
        setAnnouncement(`Reading ${post.title}`);
      }
      // Reset flag after state updates
      setTimeout(() => {
        isManualPostSelection.current = false;
      }, 0);
    },
    [posts]
  );

  // Handle mobile back navigation
  const handleMobileBack = useCallback(() => {
    if (mobilePanel === "postContent") {
      // Go back from PostContent to PostList
      isNavigatingBack.current = true;
      setMobilePanel("postList");
      setSelectedPostId(null);
      setAnnouncement(`Back to ${selectedCategory} posts`);
      // Reset flag after state updates
      setTimeout(() => {
        isNavigatingBack.current = false;
      }, 0);
    } else if (mobilePanel === "postList" && selectedCategory !== "Home") {
      // Go back from PostList to Home
      isNavigatingBack.current = true;
      setMobilePanel("postList");
      setSelectedCategory("Home");
      setSelectedPostId(null);
      setAnnouncement("Back to home");
      // Reset flag after state updates
      setTimeout(() => {
        isNavigatingBack.current = false;
      }, 0);
    }
  }, [mobilePanel, selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // ? key - show keyboard shortcuts help
      if (e.key === "?") {
        e.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }

      // Escape key - close mobile menu or go back
      if (e.key === "Escape") {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (mobilePanel === "postContent") {
          handleMobileBack();
        } else if (mobilePanel === "postList") {
          handleMobileBack();
        }
        return;
      }

      // Only handle navigation keys when not on home page or menu is open
      if (
        mobilePanel === "postList" &&
        selectedCategory === "Home" &&
        !isMenuOpen
      ) {
        return;
      }

      // j/k keys for next/previous post (Vim-style)
      if (e.key === "j" || e.key === "k") {
        if (selectedCategory === "Home" || !posts || posts.length === 0) {
          return;
        }

        e.preventDefault();
        const currentIndex = selectedPostId
          ? posts.findIndex((p) => p._id === selectedPostId)
          : -1;

        if (e.key === "j") {
          // Next post
          const nextIndex =
            currentIndex < posts.length - 1 ? currentIndex + 1 : 0;
          handleSelectPost(posts[nextIndex]._id);
        } else {
          // Previous post
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
          handleSelectPost(posts[prevIndex]._id);
        }
        return;
      }

      // Arrow keys for navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (selectedCategory === "Home" || !posts || posts.length === 0) {
          return;
        }

        e.preventDefault();
        const currentIndex = selectedPostId
          ? posts.findIndex((p) => p._id === selectedPostId)
          : -1;

        if (e.key === "ArrowDown") {
          const nextIndex =
            currentIndex < posts.length - 1 ? currentIndex + 1 : currentIndex;
          if (nextIndex !== currentIndex) {
            handleSelectPost(posts[nextIndex]._id);
          }
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          if (prevIndex !== currentIndex) {
            handleSelectPost(posts[prevIndex]._id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    mobilePanel,
    isMenuOpen,
    selectedCategory,
    selectedPostId,
    posts,
    handleSelectPost,
    handleMobileBack,
    showKeyboardHelp,
  ]);

  // Focus management - auto-focus first post when category changes
  useEffect(() => {
    if (
      selectedCategory !== "Home" &&
      posts &&
      posts.length > 0 &&
      !selectedPostId &&
      mobilePanel === "postList"
    ) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const firstPostCard = document.querySelector(
          "[data-post-id]"
        ) as HTMLElement;
        if (firstPostCard) {
          firstPostCard.focus();
        }
      }, 100);
    }
  }, [selectedCategory, posts, selectedPostId, mobilePanel]);

  // Announce changes to screen readers
  useEffect(() => {
    if (announcement && announcementRef.current) {
      announcementRef.current.textContent = announcement;
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 1000);
    }
  }, [announcement]);

  // Animate mobile panel transitions with GSAP
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = prefersReducedMotion ? 0 : 0.3;

    const panels = [
      {
        ref: postListPanelRef,
        isActive: mobilePanel === "postList" && selectedCategory !== "Home",
      },
      {
        ref: homePanelRef,
        isActive: mobilePanel === "postList" && selectedCategory === "Home",
      },
      { ref: postContentPanelRef, isActive: mobilePanel === "postContent" },
    ];

    panels.forEach(({ ref, isActive }) => {
      if (ref.current) {
        if (isActive) {
          gsap.to(ref.current, {
            opacity: 1,
            duration,
            ease: "power2.out",
            pointerEvents: "auto",
          });
        } else {
          gsap.to(ref.current, {
            opacity: 0,
            duration,
            ease: "power2.out",
            pointerEvents: "none",
          });
        }
      }
    });
  }, [mobilePanel, selectedCategory]);

  // Set initial panel state
  useEffect(() => {
    if (
      homePanelRef.current &&
      mobilePanel === "postList" &&
      selectedCategory === "Home"
    ) {
      gsap.set(homePanelRef.current, {
        opacity: 1,
        pointerEvents: "auto",
      });
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* ARIA live region for screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Navigate the blog using these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Navigation</span>
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">j</kbd>{" "}
                  Next post
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">k</kbd>{" "}
                  Previous post
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd> /{" "}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>{" "}
                  Navigate posts
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Actions</span>
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Enter
                  </kbd>{" "}
                  /{" "}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Space
                  </kbd>{" "}
                  Select post
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>{" "}
                  Go back / Close
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Help</span>
              <div className="text-right text-sm text-muted-foreground">
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>{" "}
                  Show this help
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Help Button */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg"
          aria-label="Show keyboard shortcuts"
          onClick={() => setShowKeyboardHelp(true)}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="flex items-center gap-2 border-b bg-background p-4 lg:hidden min-w-0">
        {mobilePanel !== "postList" && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={handleMobileBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="flex-1 text-xl font-bold truncate min-w-0">
          {mobilePanel === "postList" &&
            selectedCategory === "Home" &&
            "My Blog"}
          {mobilePanel === "postList" &&
            selectedCategory !== "Home" &&
            `${selectedCategory} Posts`}
          {mobilePanel === "postContent" && selectedPost?.title}
        </h1>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-hidden">
              <BlogNavigationSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                categories={categories}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout - Dynamic Columns */}
      <div
        className={`hidden h-full lg:grid overflow-hidden ${
          selectedCategory === "Home"
            ? "lg:grid-cols-[280px_1fr]"
            : "lg:grid-cols-[280px_400px_1fr]"
        }`}
      >
        {/* Left Panel - Navigation */}
        <div className="relative z-10 overflow-hidden">
          <BlogNavigationSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            categories={categories}
          />
        </div>

        {/* Middle Panel - Post List (hidden when Home is selected) */}
        {selectedCategory !== "Home" && (
          <PostList
            posts={posts}
            selectedPostId={selectedPostId}
            onSelectPost={handleSelectPost}
            category={selectedCategory}
          />
        )}

        {/* Right Panel - Post Content or Home */}
        {selectedCategory !== "Home" ? (
          <PostContent post={selectedPost} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="max-w-2xl p-8 text-center">
              <h1 className="mb-4 text-4xl font-bold">Home</h1>
              <p className="text-lg text-muted-foreground">
                Select a category from the sidebar to view articles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout - Single Panel */}
      <div className="h-[calc(100vh-73px)] lg:hidden relative">
        <div
          ref={postListPanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          {selectedCategory !== "Home" && (
            <PostList
              posts={posts}
              selectedPostId={selectedPostId}
              onSelectPost={handleSelectPost}
              category={selectedCategory}
            />
          )}
        </div>

        <div
          ref={homePanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          {selectedCategory === "Home" && (
            <div className="flex h-full items-center justify-center bg-background">
              <div className="max-w-md p-8 text-center">
                <h1 className="mb-4 text-4xl font-bold">Home</h1>
                <p className="text-muted-foreground">
                  Select a category from the menu to view articles.
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          ref={postContentPanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          <PostContent post={selectedPost} />
        </div>
      </div>
    </div>
  );
}
