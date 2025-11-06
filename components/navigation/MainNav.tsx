"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Newspaper, Home, Sparkles } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: "/blog",
      label: "Blog",
      icon: <Newspaper className="h-4 w-4 mr-2" />,
    },
    {
      href: "/digest",
      label: "AI Tech Digest",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex gap-6 md:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
