"use client";

import { ThemeToggle } from "@/components/theme-toggle";
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
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  BookOpen,
  Briefcase,
  FileEdit,
  FileText,
  Home,
  PlusCircle,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 px-2 py-4">
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
                        tooltip="Navigate to home"
                        aria-label="Navigate to home"
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
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              {/* Author section - visible to admins and approved authors */}
              {canPerformAuthorActions && (
                <>
                  <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                      Author
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            className="w-full justify-start hover:!bg-accent hover:!text-accent-foreground !bg-transparent"
                          >
                            <Link href="/my-posts" aria-label="View my posts">
                              <FileEdit className="mr-2 h-4 w-4" />
                              <span>My Posts</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            className="w-full justify-start hover:!bg-accent hover:!text-accent-foreground !bg-transparent"
                          >
                            <Link
                              href="/create-post"
                              aria-label="Create a new post"
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              <span>Create Post</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                  <SidebarSeparator />
                </>
              )}

              {/* Admin section - only visible to admins */}
              {isAdmin && (
                <>
                  <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                      Admin
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            className="w-full justify-start hover:!bg-accent hover:!text-accent-foreground !bg-transparent"
                          >
                            <Link
                              href="/admin"
                              aria-label="Open admin dashboard"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                  <SidebarSeparator />
                </>
              )}

              {/* Articles section */}
              <SidebarGroup>
                <SidebarGroupLabel className="px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                  Articles
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
                          tooltip={`View ${category} articles`}
                          aria-label={`View ${category} articles`}
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
                            {categoryIcons[category] || (
                              <BookOpen className="h-4 w-4" />
                            )}
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
          <div className="p-4">
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
