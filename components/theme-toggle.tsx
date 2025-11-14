"use client";

import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration-safe mounting pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleValueChange = (value: string) => {
    setTheme(value);
  };

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 w-full">
          <div className="grid w-full grid-cols-3 gap-1">
            <div className="h-7 rounded-md bg-muted-foreground/20" />
            <div className="h-7 rounded-md bg-muted-foreground/20" />
            <div className="h-7 rounded-md bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={theme} onValueChange={handleValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="light">Light</TabsTrigger>
        <TabsTrigger value="dark">Dark</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
