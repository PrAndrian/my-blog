"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Briefcase,
  FileText,
  Home,
  Search,
  ShoppingBag,
  Sparkles,
  PlusCircle,
  FileEdit,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

interface BlogNavigationSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Productivity: <Sparkles className="h-4 w-4" />,
  AI: <Sparkles className="h-4 w-4" />,
  Career: <Briefcase className="h-4 w-4" />,
  "Job Search": <Search className="h-4 w-4" />,
  Gear: <ShoppingBag className="h-4 w-4" />,
  Templates: <FileText className="h-4 w-4" />,
};

export function BlogNavigationSidebar({
  selectedCategory,
  onSelectCategory,
  categories,
}: BlogNavigationSidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAuthor = useQuery(api.users.isAuthor);
  const isAdmin = useQuery(api.users.isAdmin);
  const canPerformAuthorActions = useQuery(api.users.canPerformAuthorActions);
  const categoryButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management for selected category
  useEffect(() => {
    const selectedButton = categoryButtonsRef.current.get(selectedCategory);
    if (selectedButton) {
      selectedButton.focus();
    }
  }, [selectedCategory]);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background m-2 mr-0 border-l border-y rounded-l-xl h-full",
        selectedCategory === "Home" ? "rounded-r-xl" : "rounded-r-none"
      )}
    >
      {/* Header with Signature Image */}
      <div className="p-4 flex justify-center">
        {mounted && (
          <Image
            src={
              resolvedTheme === "dark"
                ? "/assets/princy-sign-light.png"
                : "/assets/princy-sign-dark.png"
            }
            alt="My Blog"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        )}
        {!mounted && (
          <div className="h-20 w-[200px] flex items-center justify-center">
            <span className="text-2xl font-bold tracking-tight">My Blog</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 px-2 py-4">
        <div className="space-y-1">
          {/* Home button */}
          <Button
            ref={(el) => {
              if (el) categoryButtonsRef.current.set("Home", el);
            }}
            variant={selectedCategory === "Home" ? "secondary" : "ghost"}
            className="w-full justify-start transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onSelectCategory("Home")}
            aria-label="Navigate to home"
            aria-current={selectedCategory === "Home" ? "page" : undefined}
          >
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Home
          </Button>

          <Separator />

          {/* Author section - visible to admins and approved authors */}
          {canPerformAuthorActions && (
            <>
              <div className="px-2 py-2">
                <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                  Author
                </h2>
                <div className="space-y-1">
                  <Link href="/my-posts">
                    <Button variant="ghost" className="w-full justify-start" aria-label="View my posts">
                      <FileEdit className="mr-2 h-4 w-4" aria-hidden="true" />
                      My Posts
                    </Button>
                  </Link>
                  <Link href="/create-post">
                    <Button variant="ghost" className="w-full justify-start" aria-label="Create a new post">
                      <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                      Create Post
                    </Button>
                  </Link>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Admin section - only visible to admins */}
          {isAdmin && (
            <>
              <div className="px-2 py-2">
                <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                  Admin
                </h2>
                <div className="space-y-1">
                  <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start" aria-label="Open admin dashboard">
                      <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Articles section */}
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
              Articles
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  ref={(el) => {
                    if (el) categoryButtonsRef.current.set(category, el);
                  }}
                  variant={
                    selectedCategory === category ? "secondary" : "ghost"
                  }
                  className="w-full justify-start transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => onSelectCategory(category)}
                  aria-label={`View ${category} articles`}
                  aria-current={selectedCategory === category ? "page" : undefined}
                >
                  <span aria-hidden="true" className="mr-2">
                    {categoryIcons[category] || <BookOpen className="h-4 w-4" />}
                  </span>
                  <span>{category}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer - Sticky */}
      <div className="sticky bottom-0 mt-auto border-t bg-background">
        <div className="p-4">
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
