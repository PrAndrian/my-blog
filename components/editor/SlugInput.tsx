"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  title: string; // Current title to auto-generate from
  excludePostId?: Id<"posts">; // For editing existing posts
}

export function SlugInput({
  value,
  onChange,
  title,
  excludePostId,
}: SlugInputProps) {
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [debouncedSlug, setDebouncedSlug] = useState(value);

  // Check slug availability
  const isAvailable = useQuery(
    api.posts.checkSlugAvailability,
    debouncedSlug
      ? {
          slug: debouncedSlug,
          excludePostId,
        }
      : "skip"
  );

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!isManuallyEdited && title) {
      const newSlug = generateSlug(title);
      onChange(newSlug);
    }
  }, [title, isManuallyEdited, onChange]);

  // Debounce slug input for availability check
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSlug(value);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManuallyEdited(true);
    const newValue = e.target.value;
    // Keep slug URL-safe as user types
    const sanitized = generateSlug(newValue);
    onChange(sanitized);
  };

  const showValidation = value && value === debouncedSlug;
  const isChecking = value !== debouncedSlug && value.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">
        URL Slug
        <span className="text-xs text-muted-foreground ml-2">
          (auto-generated from title, but editable)
        </span>
      </Label>
      <div className="relative">
        <Input
          id="slug"
          value={value}
          onChange={handleChange}
          placeholder="my-awesome-post"
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {showValidation && isAvailable === true && (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
          {showValidation && isAvailable === false && (
            <XCircle className="w-4 h-4 text-destructive" />
          )}
        </div>
      </div>
      {showValidation && (
        <p
          className={`text-xs ${
            isAvailable ? "text-green-600" : "text-destructive"
          }`}
        >
          {isAvailable
            ? "This slug is available"
            : "This slug is already taken. Please choose a different one."}
        </p>
      )}
      {value && (
        <p className="text-xs text-muted-foreground">
          Your post will be available at: <code>/blog/{value}</code>
        </p>
      )}
    </div>
  );
}
