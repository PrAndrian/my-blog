import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

interface UseKeyboardNavigationOptions {
  enabled: boolean;
  posts: Doc<"posts">[] | undefined;
  selectedCategory: string;
  selectedPostId: Id<"posts"> | null;
  mobilePanel: string;
  isMenuOpen: boolean;
  onSelectPost: (postId: Id<"posts">) => void;
  onMobileBack: () => void;
  onShowHelp?: () => void;
  onCloseHelp?: () => void;
  showKeyboardHelp?: boolean;
}

export function useKeyboardNavigation({
  enabled,
  posts,
  selectedCategory,
  selectedPostId,
  mobilePanel,
  isMenuOpen,
  onSelectPost,
  onMobileBack,
  onShowHelp,
  onCloseHelp,
  showKeyboardHelp = false,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        onShowHelp?.();
        return;
      }

      if (e.key === "Escape") {
        if (showKeyboardHelp) {
          onCloseHelp?.();
        } else if (isMenuOpen) {
          // Menu close handled by Sheet component
        } else if (mobilePanel === "postContent" || mobilePanel === "postList") {
          onMobileBack();
        }
        return;
      }

      if (
        mobilePanel === "postList" &&
        selectedCategory === "Home" &&
        !isMenuOpen
      ) {
        return;
      }

      if (e.key === "j" || e.key === "k") {
        if (selectedCategory === "Home" || !posts || posts.length === 0) {
          return;
        }

        e.preventDefault();
        const currentIndex = selectedPostId
          ? posts.findIndex((p) => p._id === selectedPostId)
          : -1;

        if (e.key === "j") {
          const nextIndex =
            currentIndex < posts.length - 1 ? currentIndex + 1 : 0;
          onSelectPost(posts[nextIndex]._id);
        } else {
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
          onSelectPost(posts[prevIndex]._id);
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (selectedCategory === "Home" || !posts || posts.length === 0) {
          return;
        }

        e.preventDefault();
        const currentIndex = selectedPostId
          ? posts.findIndex((p) => p._id === selectedPostId)
          : -1;

        if (e.key === "ArrowDown") {
          const nextIndex = currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
          onSelectPost(posts[nextIndex]._id);
        } else {
          const prevIndex = currentIndex < posts.length - 1 ? currentIndex + 1 : 0;
          onSelectPost(posts[prevIndex]._id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    posts,
    selectedCategory,
    selectedPostId,
    mobilePanel,
    isMenuOpen,
    onSelectPost,
    onMobileBack,
    onShowHelp,
    onCloseHelp,
    showKeyboardHelp,
  ]);
}

