"use client";

import { RequireAuthor } from "@/components/auth/RequireAuthor";
import { PostForm, PostFormData } from "@/components/editor/PostForm";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccess, showError } from "@/lib/toast";
import { handleMutationError } from "@/lib/errors";

export default function CreatePostPage() {
  return (
    <RequireAuthor>
      <CreatePostContent />
    </RequireAuthor>
  );
}

function CreatePostContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPost = useMutation(api.posts.createPost);

  const handleSubmit = async (data: PostFormData, isDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const postId = await createPost({
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
          ? "Post saved as draft successfully!"
          : "Post published successfully!"
      );

      router.push("/my-posts");
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to create post. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/my-posts">
            <Button variant="ghost" size="sm" aria-label="Go back to my posts">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to My Posts
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost" size="sm" aria-label="Go to blog platform">
              <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
              View Blog
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground mt-2">
          Write your content in Markdown format. You can save as a draft or
          publish immediately.
        </p>
      </div>

      <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
