"use client";

import { RequireAuthor } from "@/components/auth/RequireAuthor";
import {
  CATEGORIES,
  PostForm,
  PostFormData,
} from "@/components/editor/PostForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { handleMutationError } from "@/lib/errors";
import { showError, showSuccess } from "@/lib/toast";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditPostPage() {
  return (
    <RequireAuthor>
      <EditPostContent />
    </RequireAuthor>
  );
}

function EditPostContent() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const postId = params.id as Id<"posts">;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = useQuery(api.posts.getPostById, { postId });
  const updatePost = useMutation(api.posts.updatePost);

  const handleSubmit = async (data: PostFormData, isDraft: boolean) => {
    setIsSubmitting(true);
    try {
      await updatePost({
        postId,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        slug: data.slug,
        featuredImageUrl: data.featuredImageUrl,
        status: isDraft ? "draft" : "published",
        seo_title: data.seo_title,
        meta_description: data.meta_description,
        og_image_url: data.og_image_url,
      });

      showSuccess(
        isDraft
          ? "Post updated and saved as draft!"
          : "Post updated and published!"
      );

      router.push(`/${locale}/my-posts`);
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to update post. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (post === undefined) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  // Post not found or user doesn't have access
  if (post === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <p className="text-muted-foreground">
            The post you are looking for does not exist or you do not have
            permission to edit it.
          </p>
          <Link href={`/${locale}/my-posts`}>
            <Button aria-label="Go to my posts page">Go to My Posts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <Link href={`/${locale}/my-posts`}>
          <Button variant="ghost" size="sm" aria-label="Go back to my posts">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back
          </Button>
        </Link>
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="sm" aria-label="Go to blog platform">
            <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
            View Blog
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <PostForm
          initialData={{
            title: post.title,
            content: post.content,
            category: post.category as (typeof CATEGORIES)[number],
            tags: post.tags,
            slug: post.slug,
            featuredImageUrl: post.featuredImageUrl,
            status: (post.status as "draft" | "published") || "published",
            seo_title: post.seo_title,
            meta_description: post.meta_description,
            og_image_url: post.og_image_url,
          }}
          postId={postId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
