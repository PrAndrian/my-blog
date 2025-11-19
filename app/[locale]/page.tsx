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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useBlogNavigation } from "@/hooks/useBlogNavigation";
import { useFocusManagement } from "@/hooks/useFocusManagement";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useMobilePanelAnimation } from "@/hooks/useMobilePanelAnimation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useQuery } from "convex/react";
import { ArrowLeft, HelpCircle, Keyboard, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [announcement, setAnnouncement] = useState<string>("");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const t = useTranslations("HomePage");
  const tKeyboard = useTranslations("Keyboard");
  const tPostList = useTranslations("PostList");
  const tNavigation = useTranslations("Navigation");

  const categories = useQuery(api.posts.getCategories) ?? [];

  // Read initial category and post from URL params
  const initialCategoryFromUrl = searchParams.get("category") || "Home";
  const initialPostIdFromUrl = searchParams.get("post") as Id<"posts"> | null;

  const navigation = useBlogNavigation({
    posts: undefined,
    onAnnouncement: setAnnouncement,
    initialCategory: initialCategoryFromUrl,
  });

  const postsQuery = useQuery(
    api.posts.getPostsByCategory,
    navigation.selectedCategory !== "Home"
      ? { category: navigation.selectedCategory }
      : "skip"
  );

  const posts = postsQuery ?? [];
  const _isPostsLoading = postsQuery === undefined;

  const navigationWithPosts = useBlogNavigation({
    posts,
    onAnnouncement: setAnnouncement,
    initialCategory: initialCategoryFromUrl,
  });

  // Set initial post ID from URL if present (wait for posts to load)
  const hasSetInitialPost = useRef(false);
  useEffect(() => {
    if (
      initialPostIdFromUrl &&
      !hasSetInitialPost.current &&
      !navigationWithPosts.selectedPostId &&
      posts.length > 0
    ) {
      // Verify the post exists in the loaded posts
      const postExists = posts.some((p) => p._id === initialPostIdFromUrl);
      if (postExists) {
        navigationWithPosts.setSelectedPostId(initialPostIdFromUrl);
        navigationWithPosts.setMobilePanel("postContent");
        hasSetInitialPost.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostIdFromUrl, posts, navigationWithPosts.selectedPostId]);

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
              {tKeyboard("shortcuts")}
            </DialogTitle>
            <DialogDescription>{tKeyboard("navigation")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">
                {tKeyboard("navigation")}
              </span>
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>j</Kbd>
                  <span>{tKeyboard("nextPost")}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>k</Kbd>
                  <span>{tKeyboard("previousPost")}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <KbdGroup>
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                  </KbdGroup>
                  <span>{tKeyboard("navigatePosts")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">
                {tKeyboard("actions")}
              </span>
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1 justify-end">
                  <KbdGroup>
                    <Kbd>Enter</Kbd>
                    <Kbd>Space</Kbd>
                  </KbdGroup>
                  <span>{tKeyboard("selectPost")}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>Esc</Kbd>
                  <span>{tKeyboard("goBack")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">{tKeyboard("help")}</span>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-end">
                  <Kbd>?</Kbd>
                  <span>{tKeyboard("showHelp")}</span>
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
            tNavigation("blogTitle")}
          {finalNavigation.mobilePanel === "postList" &&
            finalNavigation.selectedCategory !== "Home" &&
            `${finalNavigation.selectedCategory} ${tPostList("posts")}`}
          {finalNavigation.mobilePanel === "postContent" &&
            finalNavigation.selectedPost?.title}
        </h1>
        <Sheet
          open={finalNavigation.isMenuOpen}
          onOpenChange={finalNavigation.setIsMenuOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              suppressHydrationWarning
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
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
            onSelectPost={(postId, category) => {
              // Navigate to the post with category and post ID in URL
              const url = `/?category=${encodeURIComponent(
                category
              )}&post=${postId}`;
              router.push(url);
            }}
          />
        </div>

        {finalNavigation.selectedCategory !== "Home" && (
          <PostList
            posts={postsQuery}
            selectedPostId={finalNavigation.selectedPostId}
            onSelectPost={finalNavigation.handleSelectPost}
            category={finalNavigation.selectedCategory}
          />
        )}

        {finalNavigation.selectedCategory !== "Home" ? (
          <PostContent
            post={finalNavigation.selectedPost}
            isLoading={
              finalNavigation.selectedPostId !== null
                ? finalNavigation.selectedPost === null
                : false
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-background relative overflow-hidden">
            {/* Subtle Grid Background */}
            <div
              className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
              style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="max-w-3xl p-8 relative z-10">
              <h1 className="mb-6 text-5xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
                {t("greeting")} 👋
              </h1>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  {t("intro")}{" "}
                  <span className="font-semibold text-foreground">
                    {t("company")}
                  </span>
                  , {t("experience")}
                </p>
                <p>
                  {t("mentorship")}{" "}
                  <span className="font-semibold text-foreground">
                    {t("mentorRole")}
                  </span>{" "}
                  {t("mentorDescription")}
                </p>
                <p>{t("blogDescription")}</p>

                <p className="pt-6 text-start italic">{t("selectCategory")}</p>
              </div>
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
              posts={postsQuery}
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
            <div className="flex h-full items-center justify-center bg-background p-6 relative overflow-hidden">
              {/* Subtle Grid Background */}
              <div
                className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
                style={{
                  backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="max-w-lg relative z-10">
                <h1 className="mb-6 text-4xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
                  {t("greeting")} 👋
                </h1>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    {t("intro")}{" "}
                    <span className="font-semibold text-foreground">
                      {t("company")}
                    </span>
                    , {t("experience")}
                  </p>
                  <p>
                    {t("mentorship")}{" "}
                    <span className="font-semibold text-foreground">
                      {t("mentorRole")}
                    </span>{" "}
                    {t("mentorDescription")}
                  </p>
                  <p>{t("blogDescription")}</p>
                  <div className="pt-4 space-y-2">
                    <a
                      href="mailto:princydruh@gmail.com"
                      className="block text-sm font-medium hover:underline text-foreground"
                    >
                      📧 princydruh@gmail.com
                    </a>
                    <a
                      href="https://www.linkedin.com/in/princy-and"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium hover:underline text-foreground"
                    >
                      💼 LinkedIn
                    </a>
                    <a
                      href="https://portfolio-asboevkl5-prandriansprojects.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium hover:underline text-foreground"
                    >
                      🌐 Portfolio
                    </a>
                  </div>
                  <p className="pt-6 text-center italic text-sm">
                    {t("openMenu")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          ref={postContentPanelRef}
          className="absolute inset-0 opacity-0 pointer-events-none"
        >
          <PostContent
            post={finalNavigation.selectedPost}
            isLoading={
              finalNavigation.selectedPostId !== null
                ? finalNavigation.selectedPost === null
                : false
            }
          />
        </div>
      </div>
    </div>
  );
}
