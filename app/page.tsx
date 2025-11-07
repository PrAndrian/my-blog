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
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useBlogNavigation } from "@/hooks/useBlogNavigation";
import { useFocusManagement } from "@/hooks/useFocusManagement";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useMobilePanelAnimation } from "@/hooks/useMobilePanelAnimation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useQuery } from "convex/react";
import { ArrowLeft, HelpCircle, Keyboard, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [announcement, setAnnouncement] = useState<string>("");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const categories = useQuery(api.posts.getCategories) ?? [];

  const navigation = useBlogNavigation({
    posts: undefined,
    onAnnouncement: setAnnouncement,
  });

  const posts =
    useQuery(
      api.posts.getPostsByCategory,
      navigation.selectedCategory !== "Home"
        ? { category: navigation.selectedCategory }
        : "skip"
    ) ?? [];

  const navigationWithPosts = useBlogNavigation({
    posts,
    onAnnouncement: setAnnouncement,
    initialCategory: navigation.selectedCategory,
  });

  useEffect(() => {
    if (navigation.selectedCategory !== navigationWithPosts.selectedCategory) {
      navigationWithPosts.setSelectedCategory(navigation.selectedCategory);
    }
  }, [navigation.selectedCategory, navigationWithPosts]);

  const handleSelectCategory = (category: string) => {
    navigation.setSelectedCategory(category);
    navigationWithPosts.handleSelectCategory(category);
  };

  const finalNavigation = {
    ...navigationWithPosts,
    handleSelectCategory,
  };

  useUrlSync({
    selectedCategory: finalNavigation.selectedCategory,
    selectedPostId: finalNavigation.selectedPostId,
    onCategoryChange: finalNavigation.setSelectedCategory,
    onPostChange: finalNavigation.setSelectedPostId,
    onPanelChange: finalNavigation.setMobilePanel,
    enabled: true,
  });

  const { postListPanelRef, homePanelRef, postContentPanelRef } =
    useMobilePanelAnimation({
      mobilePanel: finalNavigation.mobilePanel,
      selectedCategory: finalNavigation.selectedCategory,
    });

  const announcementRef = useAnnouncement(announcement);

  useKeyboardNavigation({
    enabled: true,
    posts,
    selectedCategory: finalNavigation.selectedCategory,
    selectedPostId: finalNavigation.selectedPostId,
    mobilePanel: finalNavigation.mobilePanel,
    isMenuOpen: finalNavigation.isMenuOpen,
    onSelectPost: finalNavigation.handleSelectPost,
    onMobileBack: finalNavigation.handleMobileBack,
    onShowHelp: () => setShowKeyboardHelp(true),
    onCloseHelp: () => setShowKeyboardHelp(false),
    showKeyboardHelp,
  });

  useFocusManagement({
    selectedCategory: finalNavigation.selectedCategory,
    posts,
    selectedPostId: finalNavigation.selectedPostId,
    mobilePanel: finalNavigation.mobilePanel,
    enabled: true,
  });

  return (
    <div className="h-screen w-full overflow-hidden">
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

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
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>j</Kbd>
                  <span>Next post</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>k</Kbd>
                  <span>Previous post</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <KbdGroup>
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                  </KbdGroup>
                  <span>Navigate posts</span>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Actions</span>
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1 justify-end">
                  <KbdGroup>
                    <Kbd>Enter</Kbd>
                    <Kbd>Space</Kbd>
                  </KbdGroup>
                  <span>Select post</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>Esc</Kbd>
                  <span>Go back / Close</span>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Help</span>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>?</Kbd>
                  <span>Show this help</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      <div className="flex items-center gap-2 border-b bg-background p-4 lg:hidden min-w-0">
        {finalNavigation.mobilePanel !== "postList" && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={finalNavigation.handleMobileBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="flex-1 text-xl font-bold truncate min-w-0">
          {finalNavigation.mobilePanel === "postList" &&
            finalNavigation.selectedCategory === "Home" &&
            "My Blog"}
          {finalNavigation.mobilePanel === "postList" &&
            finalNavigation.selectedCategory !== "Home" &&
            `${finalNavigation.selectedCategory} Posts`}
          {finalNavigation.mobilePanel === "postContent" &&
            finalNavigation.selectedPost?.title}
        </h1>
        <Sheet
          open={finalNavigation.isMenuOpen}
          onOpenChange={finalNavigation.setIsMenuOpen}
        >
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <BlogNavigationSidebar
                selectedCategory={finalNavigation.selectedCategory}
                onSelectCategory={finalNavigation.handleSelectCategory}
                categories={categories}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div
        className={`hidden h-full lg:grid overflow-hidden ${
          finalNavigation.selectedCategory === "Home"
            ? "lg:grid-cols-[280px_1fr]"
            : "lg:grid-cols-[280px_400px_1fr]"
        }`}
      >
        <div className="relative z-10 overflow-hidden">
          <BlogNavigationSidebar
            selectedCategory={finalNavigation.selectedCategory}
            onSelectCategory={finalNavigation.handleSelectCategory}
            categories={categories}
          />
        </div>

        {finalNavigation.selectedCategory !== "Home" && (
          <PostList
            posts={posts}
            selectedPostId={finalNavigation.selectedPostId}
            onSelectPost={finalNavigation.handleSelectPost}
            category={finalNavigation.selectedCategory}
          />
        )}

        {finalNavigation.selectedCategory !== "Home" ? (
          <PostContent post={finalNavigation.selectedPost} />
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

      <div className="h-[calc(100vh-73px)] lg:hidden relative">
        <div
          ref={postListPanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          {finalNavigation.selectedCategory !== "Home" && (
            <PostList
              posts={posts}
              selectedPostId={finalNavigation.selectedPostId}
              onSelectPost={finalNavigation.handleSelectPost}
              category={finalNavigation.selectedCategory}
            />
          )}
        </div>

        <div
          ref={homePanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          {finalNavigation.selectedCategory === "Home" && (
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
          <PostContent post={finalNavigation.selectedPost} />
        </div>
      </div>
    </div>
  );
}
