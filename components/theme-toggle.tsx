"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleValueChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setTheme(value as Theme);
    }
  };

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
