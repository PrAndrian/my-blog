"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BlogNavigationSidebar } from "@/components/blog/BlogNavigationSidebar";
import { PostList } from "@/components/blog/PostList";
import { PostContent } from "@/components/blog/PostContent";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, Database } from "lucide-react";

type MobilePanel = "navigation" | "postList" | "postContent";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Home");
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch categories and posts
  const categories = useQuery(api.posts.getCategories) ?? [];
  const seedPosts = useMutation(api.seed.seedPosts);
  const allPosts = useQuery(
    api.posts.getPostsByCategory,
    selectedCategory !== "Home" ? { category: selectedCategory } : "skip"
  ) ?? [];
  const posts = selectedCategory !== "Home" ? allPosts : [];

  // Get selected post
  const selectedPost = posts.find((post) => post._id === selectedPostId) ?? null;

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

  // Handle seeding the database
  const handleSeedDatabase = async () => {
    try {
      await seedPosts();
      alert("Database seeded successfully! Refresh the page to see the posts.");
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Error seeding database. Check console for details.");
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
      <div className={`hidden h-full lg:grid ${
        selectedCategory === "Home"
          ? "lg:grid-cols-[280px_1fr]"
          : "lg:grid-cols-[280px_400px_1fr]"
      }`}>
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
              {categories.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground">
                    No blog posts found. Click the button below to seed the database with sample posts.
                  </p>
                  <Button onClick={handleSeedDatabase} size="lg">
                    <Database className="mr-2 h-5 w-5" />
                    Seed Database with Sample Posts
                  </Button>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">
                  Select a category from the sidebar to view articles.
                </p>
              )}
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
              {categories.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    No blog posts found. Click the button below to seed the database with sample posts.
                  </p>
                  <Button onClick={handleSeedDatabase} size="lg">
                    <Database className="mr-2 h-5 w-5" />
                    Seed Database
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Select a category from the menu to view articles.
                </p>
              )}
            </div>
          </div>
        )}

        {mobilePanel === "postContent" && <PostContent post={selectedPost} />}
      </div>
    </div>
  );
}
