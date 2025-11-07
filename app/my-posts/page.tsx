"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { RequireAuthor } from "@/components/auth/RequireAuthor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { showSuccess, showError } from "@/lib/toast";
import { handleMutationError } from "@/lib/errors";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";
import { PostCardSkeleton } from "@/components/blog/PostCardSkeleton";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/pagination";

export default function MyPostsPage() {
  return (
    <RequireAuthor>
      <MyPostsContent />
    </RequireAuthor>
  );
}

function MyPostsContent() {
  const router = useRouter();
  const posts = useQuery(api.posts.getMyPosts);
  const deletePost = useMutation(api.posts.deletePost);
  const publishPost = useMutation(api.posts.publishPost);
  const unpublishPost = useMutation(api.posts.unpublishPost);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: Id<"posts">;
    title: string;
  } | null>(null);

  const handleDeleteClick = (postId: Id<"posts">, title: string) => {
    setPostToDelete({ id: postId, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await deletePost({ postId: postToDelete.id });
      showSuccess("Post deleted successfully");
      setPostToDelete(null);
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to delete post");
    }
  };

  const handlePublish = async (postId: Id<"posts">) => {
    try {
      await publishPost({ postId });
      showSuccess("Post published successfully");
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to publish post");
    }
  };

  const handleUnpublish = async (postId: Id<"posts">) => {
    try {
      await unpublishPost({ postId });
      showSuccess("Post unpublished and moved to drafts");
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to unpublish post");
    }
  };

  const draftPosts = posts?.filter((p) => p.status === "draft") ?? [];
  const publishedPosts =
    posts?.filter((p) => !p.status || p.status === "published") ?? [];

  const {
    paginatedItems: paginatedDrafts,
    currentPage: draftPage,
    totalPages: draftTotalPages,
    setCurrentPage: setDraftPage,
    hasNextPage: hasNextDraftPage,
    hasPreviousPage: hasPreviousDraftPage,
  } = usePagination(draftPosts, 10);

  const {
    paginatedItems: paginatedPublished,
    currentPage: publishedPage,
    totalPages: publishedTotalPages,
    setCurrentPage: setPublishedPage,
    hasNextPage: hasNextPublishedPage,
    hasPreviousPage: hasPreviousPublishedPage,
  } = usePagination(publishedPosts, 10);

  // Loading state
  if (posts === undefined) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Posts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blog posts and drafts
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Posts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blog posts and drafts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" aria-label="Go to blog platform">
              <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
              View Blog
            </Button>
          </Link>
          <Link href="/create-post">
            <Button aria-label="Create a new blog post">
              <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Create New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Posts</CardDescription>
            <CardTitle className="text-3xl">{posts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">{publishedPosts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">{draftPosts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlusCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first blog post
            </p>
            <Link href="/create-post">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Drafts Section */}
      {draftPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Drafts ({draftPosts.length})
          </h2>
          <div className="space-y-4">
            {paginatedDrafts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeleteClick}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onEdit={(id) => router.push(`/edit-post/${id}`)}
              />
            ))}
          </div>
          {draftTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={draftPage}
                totalPages={draftTotalPages}
                onPageChange={setDraftPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Published Section */}
      {publishedPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Published ({publishedPosts.length})
          </h2>
          <div className="space-y-4">
            {paginatedPublished.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeleteClick}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onEdit={(id) => router.push(`/edit-post/${id}`)}
              />
            ))}
          </div>
          {publishedTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={publishedPage}
                totalPages={publishedTotalPages}
                onPageChange={setPublishedPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        description={
          postToDelete
            ? `Are you sure you want to delete "${postToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this post? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

interface PostCardProps {
  post: {
    _id: Id<"posts">;
    title: string;
    status?: string;
    category: string;
    date: number;
    updatedAt?: number;
    tags: string[];
  };
  onDelete: (postId: Id<"posts">, title: string) => void;
  onPublish: (postId: Id<"posts">) => void;
  onUnpublish: (postId: Id<"posts">) => void;
  onEdit: (postId: Id<"posts">) => void;
}

function PostCard({
  post,
  onDelete,
  onPublish,
  onUnpublish,
  onEdit,
}: PostCardProps) {
  const isDraft = post.status === "draft";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">{post.title}</h3>
              <Badge variant={isDraft ? "secondary" : "default"}>
                {isDraft ? "Draft" : "Published"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline">{post.category}</Badge>
              <span>•</span>
              <span>{formatDate(post.date)}</span>
              {post.updatedAt && post.updatedAt !== post.date && (
                <>
                  <span>•</span>
                  <span>Updated {formatRelativeTime(post.updatedAt)}</span>
                </>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Post actions menu">
                <MoreVertical className="w-4 h-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post._id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isDraft ? (
                <DropdownMenuItem onClick={() => onPublish(post._id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onUnpublish(post._id)}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(post._id, post.title)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
