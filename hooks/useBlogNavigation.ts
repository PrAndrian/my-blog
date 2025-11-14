import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { BREAKPOINTS } from "@/lib/constants";

type MobilePanel = "navigation" | "postList" | "postContent";

interface UseBlogNavigationOptions {
  posts: Doc<"posts">[] | undefined;
  onAnnouncement?: (message: string) => void;
  initialCategory?: string;
}

export function useBlogNavigation({
  posts,
  onAnnouncement,
  initialCategory = "Home",
}: UseBlogNavigationOptions) {
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(
    null
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("postList");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isInitialMount = useRef(true);
  const isNavigatingBack = useRef(false);
  const isManualPostSelection = useRef(false);
  const previousCategoryRef = useRef<string>(initialCategory);
  const categoryForAutoSelectRef = useRef<string | null>(null);

  const selectedPost =
    posts?.find((post) => post._id === selectedPostId) ?? null;

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Sync selectedCategory with initialCategory changes
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
      previousCategoryRef.current = initialCategory;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory]);

  const isMobile = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < BREAKPOINTS.MOBILE;
  }, []);

  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setSelectedPostId(null);
      setIsMenuOpen(false);
      onAnnouncement?.(`Navigated to ${category} category`);

      if (isMobile()) {
        setMobilePanel("postList");
      } else if (category !== "Home") {
        categoryForAutoSelectRef.current = category;
      } else {
        categoryForAutoSelectRef.current = null;
      }
    },
    [isMobile, onAnnouncement]
  );

  const handleSelectPost = useCallback(
    (postId: Id<"posts">) => {
      isManualPostSelection.current = true;
      setSelectedPostId(postId);
      setMobilePanel("postContent");
      const post = posts?.find((p) => p._id === postId);
      if (post) {
        onAnnouncement?.(`Reading ${post.title}`);
      }
    },
    [posts, onAnnouncement]
  );

  const handleMobileBack = useCallback(() => {
    if (mobilePanel === "postContent") {
      isNavigatingBack.current = true;
      setMobilePanel("postList");
      setSelectedPostId(null);
      onAnnouncement?.(`Back to ${selectedCategory} posts`);
    } else if (mobilePanel === "postList" && selectedCategory !== "Home") {
      isNavigatingBack.current = true;
      setMobilePanel("postList");
      setSelectedCategory("Home");
      setSelectedPostId(null);
      onAnnouncement?.("Back to home");
    }
  }, [mobilePanel, selectedCategory, onAnnouncement]);

  useEffect(() => {
    if (isManualPostSelection.current || isNavigatingBack.current) {
      const timeoutId = setTimeout(() => {
        isManualPostSelection.current = false;
        isNavigatingBack.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedPostId, mobilePanel, selectedCategory]);

  // Mobile panel management and auto-post selection effect
  useEffect(() => {
    if (isManualPostSelection.current || isNavigatingBack.current) {
      previousCategoryRef.current = selectedCategory;
      return;
    }

    if (isMobile()) {
      if (selectedPostId || mobilePanel === "postContent") {
        previousCategoryRef.current = selectedCategory;
        return;
      }
      if (selectedCategory !== "Home" && posts && posts.length > 0) {
        setMobilePanel("postList");
      } else if (selectedCategory === "Home") {
        setMobilePanel("postList");
      }
      previousCategoryRef.current = selectedCategory;
      return;
    }

    const categoryChanged = previousCategoryRef.current !== selectedCategory;
    if (
      !isMobile() &&
      categoryChanged &&
      selectedCategory !== "Home" &&
      posts &&
      posts.length > 0 &&
      !selectedPostId &&
      !isInitialMount.current
    ) {
      const sortedPosts = [...posts].sort((a, b) => b.date - a.date);
      const latestPost = sortedPosts[0];

      if (latestPost) {
        setSelectedPostId(latestPost._id);
        setMobilePanel("postContent");
        onAnnouncement?.(`Reading ${latestPost.title}`);
      }
    }

    previousCategoryRef.current = selectedCategory;
  }, [
    selectedCategory,
    posts,
    selectedPostId,
    mobilePanel,
    isMobile,
    onAnnouncement,
  ]);

  // Auto-select latest post when navigating to a category
  useEffect(() => {
    if (
      isMobile() ||
      isManualPostSelection.current ||
      isNavigatingBack.current ||
      isInitialMount.current
    ) {
      return;
    }

    if (
      categoryForAutoSelectRef.current &&
      categoryForAutoSelectRef.current === selectedCategory &&
      selectedCategory !== "Home" &&
      posts &&
      posts.length > 0 &&
      !selectedPostId
    ) {
      const sortedPosts = [...posts].sort((a, b) => b.date - a.date);
      const latestPost = sortedPosts[0];

      if (latestPost) {
        setSelectedPostId(latestPost._id);
        setMobilePanel("postContent");
        categoryForAutoSelectRef.current = null;
        onAnnouncement?.(`Reading ${latestPost.title}`);
      }
    }
  }, [posts, selectedCategory, selectedPostId, isMobile, onAnnouncement]);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedPostId,
    setSelectedPostId,
    selectedPost,
    mobilePanel,
    setMobilePanel,
    isMenuOpen,
    setIsMenuOpen,
    handleSelectCategory,
    handleSelectPost,
    handleMobileBack,
  };
}
