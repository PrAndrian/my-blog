import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseUrlSyncOptions {
  selectedCategory: string;
  selectedPostId: Id<"posts"> | null;
  onCategoryChange: (category: string) => void;
  onPostChange: (postId: Id<"posts">) => void;
  onPanelChange: (panel: "navigation" | "postList" | "postContent") => void;
  enabled: boolean;
}

export function useUrlSync({
  selectedCategory,
  selectedPostId,
  onCategoryChange,
  onPostChange,
  onPanelChange,
  enabled,
}: UseUrlSyncOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const isSyncingRef = useRef(false);
  const prevParamsRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || isSyncingRef.current) return;

    const categoryParam = searchParams.get("category");
    const postParam = searchParams.get("post");
    const currentParams = `${categoryParam || ""}:${postParam || ""}`;

    // On initial mount, sync from URL to state
    if (isInitialMount.current) {
      prevParamsRef.current = currentParams;
      
      // If we have a category param, set it first (even if it matches, to ensure state is correct)
      if (categoryParam) {
        isSyncingRef.current = true;
        onCategoryChange(categoryParam);
        
        // If we also have a post param, set it after category
        if (postParam) {
          // Use setTimeout to ensure category is set before post
          setTimeout(() => {
            onPostChange(postParam as Id<"posts">);
            onPanelChange("postContent");
            setTimeout(() => {
              isSyncingRef.current = false;
            }, 0);
          }, 0);
        } else {
          onPanelChange("postList");
          setTimeout(() => {
            isSyncingRef.current = false;
          }, 0);
        }
      } else if (postParam && !selectedPostId) {
        // Only post param, no category - this shouldn't happen normally, but handle it
        isSyncingRef.current = true;
        onPostChange(postParam as Id<"posts">);
        onPanelChange("postContent");
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      } else {
        // No params to sync
        isInitialMount.current = false;
        return;
      }
      
      isInitialMount.current = false;
      return;
    }

    // After initial mount, only sync if URL params actually changed
    if (currentParams === prevParamsRef.current) return;
    prevParamsRef.current = currentParams;

    // Sync from URL to state when URL changes
    const categoryChanged = categoryParam && categoryParam !== selectedCategory;
    const postChanged = postParam && postParam !== (selectedPostId || "");
    const postRemoved = !postParam && selectedPostId;

    if (categoryChanged || postChanged || postRemoved) {
      isSyncingRef.current = true;
      
      if (categoryChanged) {
        // Category changed - set category first, then post if present
        onCategoryChange(categoryParam!);
        if (postParam) {
          // Use a small delay to ensure category is set before post
          setTimeout(() => {
            onPostChange(postParam as Id<"posts">);
            onPanelChange("postContent");
            setTimeout(() => {
              isSyncingRef.current = false;
            }, 0);
          }, 0);
        } else {
          onPanelChange("postList");
          setTimeout(() => {
            isSyncingRef.current = false;
          }, 0);
        }
      } else if (postChanged && postParam) {
        // Only post changed - set post directly
        onPostChange(postParam as Id<"posts">);
        onPanelChange("postContent");
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      } else if (postRemoved) {
        // Post removed from URL
        onPostChange(null as any);
        onPanelChange("postList");
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      }
    }
  }, [enabled, searchParams, selectedCategory, selectedPostId, onCategoryChange, onPostChange, onPanelChange]);

  useEffect(() => {
    if (!enabled || isInitialMount.current || isSyncingRef.current) return;

    const params = new URLSearchParams();
    if (selectedCategory !== "Home") {
      params.set("category", selectedCategory);
      if (selectedPostId) {
        params.set("post", selectedPostId);
      }
    }

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.replace(newUrl, { scroll: false });
  }, [enabled, selectedCategory, selectedPostId, router]);
}

