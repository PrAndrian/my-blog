"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, BookOpen, Sparkles, Briefcase, Search, ShoppingBag, FileText } from "lucide-react";

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
  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-2xl font-bold tracking-tight">My Blog</h1>
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
                  variant={selectedCategory === category ? "secondary" : "ghost"}
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
    </div>
  );
}
