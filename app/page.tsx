"use client";

import { BlogNavigationSidebar } from "@/components/blog/BlogNavigationSidebar";
import { PostContent } from "@/components/blog/PostContent";
import { PostList } from "@/components/blog/PostList";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";

type MobilePanel = "navigation" | "postList" | "postContent";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Home");
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(
    null
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch categories and posts
  const categories = useQuery(api.posts.getCategories) ?? [];
  const allPosts =
    useQuery(
      api.posts.getPostsByCategory,
      selectedCategory !== "Home" ? { category: selectedCategory } : "skip"
    ) ?? [];
  const posts = selectedCategory !== "Home" ? allPosts : [];

  // Get selected post
  const selectedPost =
    posts.find((post) => post._id === selectedPostId) ?? null;

  // Handle category selection
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedPostId(null);
    setMobilePanel("postList");
    setIsMenuOpen(false);
  };

  // Handle post selection
  const handleSelectPost = (postId: Id<"posts">) => {
    setSelectedPostId(postId);
    setMobilePanel("postContent");
  };

  // Handle mobile back navigation
  const handleMobileBack = () => {
    if (mobilePanel === "postContent") {
      setMobilePanel("postList");
      setSelectedPostId(null);
    } else if (mobilePanel === "postList") {
      setMobilePanel("navigation");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 border-b bg-background p-4 lg:hidden">
        {mobilePanel !== "navigation" && (
          <Button variant="ghost" size="icon" onClick={handleMobileBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="flex-1 text-xl font-bold">
          {mobilePanel === "navigation" && "My Blog"}
          {mobilePanel === "postList" && `${selectedCategory} Posts`}
          {mobilePanel === "postContent" && selectedPost?.title}
        </h1>
        {mobilePanel === "navigation" && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <BlogNavigationSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                categories={categories}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Desktop Layout - Dynamic Columns */}
      <div
        className={`hidden h-full lg:grid ${
          selectedCategory === "Home"
            ? "lg:grid-cols-[320px_1fr]"
            : "lg:grid-cols-[320px_320px_1fr]"
        }`}
      >
        {/* Left Panel - Navigation */}
        <BlogNavigationSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          categories={categories}
        />

        {/* Middle Panel - Post List (only show when category selected) */}
        {selectedCategory !== "Home" && (
          <PostList
            posts={posts}
            selectedPostId={selectedPostId}
            onSelectPost={handleSelectPost}
            category={selectedCategory}
          />
        )}

        {/* Right Panel - Post Content */}
        {selectedCategory !== "Home" ? (
          <PostContent post={selectedPost} />
        ) : (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="max-w-2xl p-8 text-center">
              <h1 className="mb-4 text-4xl font-bold">Home</h1>
              <p className="text-lg text-muted-foreground">
                {categories.length === 0
                  ? "No blog posts found."
                  : "Select a category from the sidebar to view articles."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout - Single Panel */}
      <div className="h-[calc(100vh-73px)] lg:hidden">
        {mobilePanel === "navigation" && (
          <BlogNavigationSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            categories={categories}
          />
        )}

        {mobilePanel === "postList" && selectedCategory !== "Home" && (
          <PostList
            posts={posts}
            selectedPostId={selectedPostId}
            onSelectPost={handleSelectPost}
            category={selectedCategory}
          />
        )}

        {mobilePanel === "postList" && selectedCategory === "Home" && (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="max-w-md p-8 text-center">
              <h1 className="mb-4 text-4xl font-bold">Home</h1>
              <p className="text-muted-foreground">
                {categories.length === 0
                  ? "No blog posts found."
                  : "Select a category from the menu to view articles."}
              </p>
            </div>
          </div>
        )}

        {mobilePanel === "postContent" && <PostContent post={selectedPost} />}
      </div>
    </div>
  );
}
