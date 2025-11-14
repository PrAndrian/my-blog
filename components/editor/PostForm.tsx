"use client";

import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CATEGORIES, type PostCategory, type PostStatus } from "@/types/post";
import { PostFormHeader } from "./PostFormHeader";
import { PostFormContent } from "./PostFormContent";

// Re-export for backward compatibility
export { CATEGORIES };

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(CATEGORIES, {
    required_error: "Category is required",
  }) as z.ZodType<PostCategory>,
  tags: z.array(z.string()).default([]),
  slug: z.string().min(1, "Slug is required"),
  featuredImageUrl: z.string().optional(),
  status: z
    .enum(["draft", "published"])
    .default("draft") as z.ZodType<PostStatus>,
  // SEO metadata fields
  seo_title: z.string().optional(),
  meta_description: z
    .string()
    .max(180, "Description must be 180 characters or less")
    .optional(),
  og_image_url: z.string().optional(),
});

export type PostFormData = z.infer<typeof postFormSchema>;

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  postId?: Id<"posts">; // For editing
  onSubmit: (data: PostFormData, isDraft: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function PostForm({
  initialData,
  postId,
  onSubmit,
  isSubmitting = false,
}: PostFormProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

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
      seo_title: initialData?.seo_title,
      meta_description: initialData?.meta_description,
      og_image_url: initialData?.og_image_url,
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

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="h-full flex flex-col"
      >
        <ScrollArea className="flex-1 h-full bg-background overflow-x-hidden">
          <div className="w-full max-w-full min-w-0 box-border">
            <article className="mx-auto w-full max-w-full md:max-w-4xl min-w-0 px-4 md:px-6 py-8 box-border">
              <PostFormHeader
                form={form}
                sheetOpen={sheetOpen}
                onSheetOpenChange={setSheetOpen}
                postId={postId}
                isSubmitting={isSubmitting}
                onDraft={handleDraft}
                onPublish={handlePublish}
              />

              <PostFormContent form={form} />
            </article>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
}
