"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface DigestNavigationSidebarProps {
  className?: string;
}

export function DigestNavigationSidebar({
  className,
}: DigestNavigationSidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background m-2 mr-0 border-l border-y rounded-l-xl",
        className
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
            alt="AI Tech Digest"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        )}
        {!mounted && (
          <div className="h-20 w-[200px] flex items-center justify-center">
            <span className="text-2xl font-bold tracking-tight">
              Tech Digest
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
              AI-Powered Digest
            </h2>
            <p className="px-2 text-xs text-muted-foreground">
              Stay updated with the latest in software development, curated by
              AI to bring you the most relevant tech news and insights.
            </p>
          </div>

          <Separator className="my-4" />

          <Button variant="ghost" className="w-full justify-start" disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            All Digests
          </Button>
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
