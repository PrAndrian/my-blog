"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Id } from "@/convex/_generated/dataModel";
import { Settings } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PostFormData } from "./PostForm";
import { PostFormSettings } from "./PostFormSettings";

interface PostFormHeaderProps {
  form: UseFormReturn<PostFormData>;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
  postId?: Id<"posts">;
  isSubmitting?: boolean;
  onDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
}

export function PostFormHeader({
  form,
  sheetOpen,
  onSheetOpenChange,
  postId,
  isSubmitting = false,
  onDraft,
  onPublish,
}: PostFormHeaderProps) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full m-0">
              <FormControl>
                <Input
                  placeholder="Untitled"
                  className="mb-4 text-4xl font-bold tracking-tight break-words border-0 shadow-none focus-visible:ring-0 px-0 w-full bg-transparent h-auto py-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-shrink-0 mt-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Post Settings</SheetTitle>
            <SheetDescription>
              Configure your post metadata and publishing options.
            </SheetDescription>
          </SheetHeader>
          <PostFormSettings
            form={form}
            postId={postId}
            isSubmitting={isSubmitting}
            onDraft={onDraft}
            onPublish={onPublish}
            onClose={() => onSheetOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}
