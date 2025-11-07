import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
import { ANIMATION } from "@/lib/constants";

interface UseFocusManagementOptions {
  selectedCategory: string;
  posts: Doc<"posts">[] | undefined;
  selectedPostId: Id<"posts"> | null;
  mobilePanel: string;
  enabled: boolean;
}

export function useFocusManagement({
  selectedCategory,
  posts,
  selectedPostId,
  mobilePanel,
  enabled,
}: UseFocusManagementOptions) {
  useEffect(() => {
    if (!enabled) return;

    if (
      selectedCategory !== "Home" &&
      posts &&
      posts.length > 0 &&
      !selectedPostId &&
      mobilePanel === "postList"
    ) {
      const timeoutId = setTimeout(() => {
        const firstPostCard = document.querySelector(
          "[data-first-post='true']"
        ) as HTMLElement;
        if (firstPostCard) {
          firstPostCard.focus();
        }
      }, ANIMATION.FOCUS_DELAY);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [enabled, selectedCategory, posts, selectedPostId, mobilePanel]);
}
