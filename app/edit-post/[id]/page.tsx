"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { PostForm, PostFormData, CATEGORIES } from "@/components/editor/PostForm";
import { RequireAuthor } from "@/components/auth/RequireAuthor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { showSuccess, showError } from "@/lib/toast";
import { handleMutationError } from "@/lib/errors";
import { Skeleton } from "@/components/ui/skeleton";

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
      });

      showSuccess(
        isDraft
          ? "Post updated and saved as draft!"
          : "Post updated and published!"
      );

      router.push("/my-posts");
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
          <Link href="/my-posts">
            <Button aria-label="Go to my posts page">Go to My Posts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <Link href="/my-posts">
          <Button variant="ghost" size="sm" aria-label="Go back to my posts">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back
          </Button>
        </Link>
        <Link href="/">
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
            category: post.category as typeof CATEGORIES[number],
            tags: post.tags,
            slug: post.slug,
            featuredImageUrl: post.featuredImageUrl,
            status: (post.status as "draft" | "published") || "published",
          }}
          postId={postId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
