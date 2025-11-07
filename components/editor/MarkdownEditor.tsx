"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import { useTheme } from "next-themes";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your post content in markdown...",
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border rounded-lg h-[500px] bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div data-color-mode={theme === "dark" ? "dark" : "light"}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        height={500}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
        }}
        previewOptions={{
          className: "prose dark:prose-invert max-w-none",
        }}
      />
    </div>
  );
}
