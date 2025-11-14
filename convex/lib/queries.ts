/**
 * Shared query helper functions
 * These functions provide reusable database query patterns
 */

import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Get all published posts using the by_status index
 * This is much more efficient than fetching all posts and filtering in memory
 */
export async function getPublishedPosts(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("posts")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .order("desc")
    .collect();
}

/**
 * Get published posts by category using the compound index
 */
export async function getPublishedPostsByCategory(
  ctx: QueryCtx | MutationCtx,
  category: string
) {
  return await ctx.db
    .query("posts")
    .withIndex("by_category_and_status", (q) =>
      q.eq("category", category).eq("status", "published")
    )
    .order("desc")
    .collect();
}

/**
 * Get posts by user ID with optional status filter
 */
export async function getPostsByUserId(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  status?: "draft" | "published"
) {
  if (status) {
    return await ctx.db
      .query("posts")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", userId).eq("status", status)
      )
      .order("desc")
      .collect();
  }

  return await ctx.db
    .query("posts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}
