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

  useEffect(() => {
    if (!enabled || !isInitialMount.current) return;

    const categoryParam = searchParams.get("category");
    const postParam = searchParams.get("post");

    if (categoryParam && categoryParam !== selectedCategory) {
      isSyncingRef.current = true;
      onCategoryChange(categoryParam);
      if (postParam) {
        onPostChange(postParam as Id<"posts">);
        onPanelChange("postContent");
      } else {
        onPanelChange("postList");
      }
      isSyncingRef.current = false;
    } else if (postParam && !selectedPostId) {
      isSyncingRef.current = true;
      onPostChange(postParam as Id<"posts">);
      onPanelChange("postContent");
      isSyncingRef.current = false;
    }
    isInitialMount.current = false;
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

