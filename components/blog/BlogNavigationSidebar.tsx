"use client";

import { useTheme } from "@/app/providers/theme-provider";
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
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background m-2 mr-0 rounded-l-lg",
        selectedCategory === "Home" ? "rounded-r-lg" : "rounded-r-none"
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
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {/* Home button */}
          <Button
            variant={selectedCategory === "Home" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory("Home")}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>

          <Separator className="my-2" />

          {/* Articles section */}
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
              Articles
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => onSelectCategory(category)}
                >
                  {categoryIcons[category] || <BookOpen className="h-4 w-4" />}
                  <span className="ml-2">{category}</span>
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
