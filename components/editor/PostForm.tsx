"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Send, X } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploader } from "./ImageUploader";
import { MarkdownEditor } from "./MarkdownEditor";
import { SlugInput } from "./SlugInput";

// Zod schema for form validation
const CATEGORIES = [
  "Productivity",
  "AI",
  "Career",
  "Gear",
  "Technology",
  "Design",
  "Business",
  "Personal",
] as const;

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(CATEGORIES, {
    required_error: "Category is required",
  }),
  tags: z.array(z.string()).default([]),
  slug: z.string().min(1, "Slug is required"),
  featuredImageUrl: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type PostFormData = z.infer<typeof postFormSchema>;

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  postId?: Id<"posts">; // For editing
  onSubmit: (data: PostFormData, isDraft: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

function CategorySelectWrapper({
  field,
}: {
  field: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    ref?: React.Ref<any>;
  };
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <CategorySelect
      field={field}
      formItemId={formItemId}
      formDescriptionId={formDescriptionId}
      formMessageId={formMessageId}
      error={error}
    />
  );
}

function CategorySelect({
  field,
  formItemId,
  formDescriptionId,
  formMessageId,
  error,
}: {
  field: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
  };
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error?: { message?: string };
}) {
  const handleValueChange = (value: string) => {
    field.onChange(value);
    field.onBlur?.();
  };

  return (
    <Select onValueChange={handleValueChange} value={field.value}>
      <SelectTrigger
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        name={field.name}
      >
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
CategorySelect.displayName = "CategorySelect";

export function PostForm({
  initialData,
  postId,
  onSubmit,
  isSubmitting = false,
}: PostFormProps) {
  const [tagInput, setTagInput] = useState("");

  // Initialize form with react-hook-form
  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      category: initialData?.category || "Productivity",
      tags: initialData?.tags || [],
      slug: initialData?.slug || "",
      featuredImageUrl: initialData?.featuredImageUrl,
      status: initialData?.status || "draft",
    },
  });

  // Handle draft submission
  const handleDraft = form.handleSubmit(async (data) => {
    await onSubmit({ ...data, status: "draft" }, true);
  });

  // Handle publish submission
  const handlePublish = form.handleSubmit(async (data) => {
    await onSubmit({ ...data, status: "published" }, false);
  });

  // Tag management functions
  const addTag = () => {
    const tag = tagInput.trim();
    const currentTags = form.getValues("tags");
    if (tag && !currentTags.includes(tag)) {
      form.setValue("tags", [...currentTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Blog Post" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <SlugInput
                value={field.value}
                onChange={field.onChange}
                title={form.watch("title")}
                excludePostId={postId}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <CategorySelectWrapper field={field} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured Image */}
        <FormField
          control={form.control}
          name="featuredImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={() => field.onChange(undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Content <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MarkdownEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleDraft}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </form>
    </Form>
  );
}
