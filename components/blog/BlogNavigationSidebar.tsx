"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Briefcase,
  FileText,
  Home,
  LucideIcon,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SearchModal } from "./SearchModal";

interface BlogNavigationSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  onSelectPost?: (postId: string, category: string) => void;
}

// Icon component mapping
const iconComponents: Record<string, LucideIcon> = {
  Home,
  Sparkles,
  Briefcase,
  Search,
  ShoppingBag,
  FileText,
  BookOpen,
};

// Helper to get the icon component for a category
const getCategoryIcon = (category: string): React.ReactNode => {
  const iconName =
    CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] ||
    DEFAULT_CATEGORY_ICON;
  const IconComponent = iconComponents[iconName];
  return IconComponent ? (
    <IconComponent className="h-4 w-4" />
  ) : (
    <BookOpen className="h-4 w-4" />
  );
};

export function BlogNavigationSidebar({
  selectedCategory,
  onSelectCategory,
  categories,
  onSelectPost,
}: BlogNavigationSidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const categoryButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const t = useTranslations("Navigation");
  const tSidebar = useTranslations("BlogNavigationSidebar");
  const tCategories = useTranslations("Categories");
  const tSearch = useTranslations("Search");

  // Hydration-safe mounting pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        className={cn(
          "flex flex-col border-r bg-background m-2 mr-0 border-l border-y rounded-l-xl w-full h-screen flex-1 min-h-0 overflow-hidden",
          selectedCategory === "Home" ? "rounded-r-xl" : "rounded-r-none"
        )}
        collapsible="none"
        variant="sidebar"
      >
        <SidebarHeader className="p-4 flex justify-center">
          {mounted && (
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/assets/princy-sign-light.png"
                  : "/assets/princy-sign-dark.png"
              }
              alt={t("blogTitle")}
              width={200}
              height={80}
              className="object-contain"
              priority
            />
          )}
          {!mounted && (
            <div className="h-20 w-[200px] flex items-center justify-center">
              <span className="text-2xl font-bold tracking-tight">
                {t("blogTitle")}
              </span>
            </div>
          )}
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 px-2 py-4">
              {/* Search Bar */}
              <div className="px-2 mb-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{tSearch("placeholder")}</span>
                </Button>
              </div>

              <SidebarSeparator className="mb-4" />
              {/* Home button */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        ref={(el) => {
                          if (el) categoryButtonsRef.current.set("Home", el);
                        }}
                        onClick={() => onSelectCategory("Home")}
                        isActive={selectedCategory === "Home"}
                        tooltip={t("home")}
                        aria-label={t("home")}
                        aria-current={
                          selectedCategory === "Home" ? "page" : undefined
                        }
                        className={cn(
                          "w-full justify-start transition-all duration-200 !bg-transparent",
                          selectedCategory === "Home"
                            ? "!bg-secondary !text-secondary-foreground font-medium"
                            : "hover:!bg-accent hover:!text-accent-foreground"
                        )}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        <span>{tCategories("Home")}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              {/* Articles section */}
              <SidebarGroup>
                <SidebarGroupLabel className="px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                  {tSidebar("articles")}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categories.map((category) => (
                      <SidebarMenuItem key={category}>
                        <SidebarMenuButton
                          ref={(el) => {
                            if (el)
                              categoryButtonsRef.current.set(category, el);
                          }}
                          onClick={() => onSelectCategory(category)}
                          isActive={selectedCategory === category}
                          tooltip={tSidebar("viewArticles", { category })}
                          aria-label={tSidebar("viewArticles", { category })}
                          aria-current={
                            selectedCategory === category ? "page" : undefined
                          }
                          className={cn(
                            "w-full justify-start transition-all duration-200 !bg-transparent",
                            selectedCategory === category
                              ? "!bg-secondary !text-secondary-foreground font-medium"
                              : "hover:!bg-accent hover:!text-accent-foreground"
                          )}
                        >
                          <span className="mr-2">
                            {getCategoryIcon(category)}
                          </span>
                          <span>{category}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t mt-auto">
          <div className="p-4 flex flex-col items-start justify-between gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectPost={onSelectPost}
      />
    </SidebarProvider>
  );
}
