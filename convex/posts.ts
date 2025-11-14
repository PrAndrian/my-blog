import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./lib/auth";
import { getPublishedPosts, getPublishedPostsByCategory } from "./lib/queries";

/**
 * Get all unique categories from published posts
 * Optimized to filter by status index when available, otherwise filters after collection.
 */
export const getCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    // Get published posts using efficient index query
    // For backward compatibility, also get posts without status field
    const publishedPosts = await getPublishedPosts(ctx);

    // Get posts without status (backward compatibility - should be minimal)
    const legacyPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("status"), undefined))
      .collect();

    // Combine both sets
    const allPublishedPosts = [...publishedPosts, ...legacyPosts];

    const categories = Array.from(
      new Set(allPublishedPosts.map((post) => post.category))
    );
    return categories.sort();
  },
});

/**
 * Search posts by title, tags, category, author, or content
 * Returns published posts matching the search query
 */
export const searchPosts = query({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      status: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Get published posts using efficient index query
    const publishedPosts = await getPublishedPosts(ctx);

    // Get posts without status (backward compatibility)
    const legacyPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("status"), undefined))
      .collect();

    // Combine both sets
    const allPublishedPosts = [...publishedPosts, ...legacyPosts];

    // If query is empty, return empty array
    if (!args.query || args.query.trim().length === 0) {
      return [];
    }

    const searchTerm = args.query.toLowerCase().trim();

    // Search across multiple fields
    const matchingPosts = allPublishedPosts.filter((post) => {
      // Search in title
      if (post.title.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in author/authorName
      if (
        post.author.toLowerCase().includes(searchTerm) ||
        (post.authorName && post.authorName.toLowerCase().includes(searchTerm))
      ) {
        return true;
      }

      // Search in category
      if (post.category.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in tags
      if (post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))) {
        return true;
      }

      // Search in content (first 500 chars for performance)
      if (
        post.content.toLowerCase().substring(0, 500).includes(searchTerm)
      ) {
        return true;
      }

      return false;
    });

    // Sort by date descending (newest first)
    // Remove content field from results to match validator
    return matchingPosts
      .sort((a, b) => b.date - a.date)
      .map(({ content, ...post }) => post);
  },
});

/**
 * Get posts filtered by category, ordered by date (newest first)
 * Only returns published posts (for backward compatibility, posts without status are treated as published)
 */
export const getPostsByCategory = query({
  args: { category: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
      status: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Use efficient compound index to get published posts by category
    const publishedPosts = await getPublishedPostsByCategory(ctx, args.category);

    // Get posts without status in this category (backward compatibility)
    const legacyPosts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), undefined))
      .collect();

    // Combine both sets
    const allPosts = [...publishedPosts, ...legacyPosts];

    // Sort by date descending (newest first)
    return allPosts.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get all posts ordered by date (newest first)
 * Only returns published posts (for backward compatibility, posts without status are treated as published)
 */
export const getAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
      status: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    // Get published posts using efficient index query
    const publishedPosts = await getPublishedPosts(ctx);

    // Get posts without status (backward compatibility)
    const legacyPosts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("status"), undefined))
      .collect();

    // Combine both sets and sort
    const allPosts = [...publishedPosts, ...legacyPosts];
    return allPosts.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get a single post by its slug
 * Only returns published posts (or posts without status for backward compatibility)
 * Authors can view their own draft posts
 */
export const getPostBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();

    // If post is published (or has no status), anyone can view it
    if (!post.status || post.status === "published") {
      return post;
    }

    // If post is draft, only the author can view it
    if (!identity || post.userId !== identity.subject) {
      return null;
    }

    return post;
  },
});

// ============================================================================
// NEW MUTATIONS FOR POST MANAGEMENT
// ============================================================================

/**
 * Create a new post
 * Requires user to be authenticated and have author role
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    slug: v.string(),
    featuredImageUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuthorizedUser(ctx);

    // Check if slug is unique
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingPost) {
      throw new Error(
        `Slug "${args.slug}" is already taken. Please choose a different slug.`
      );
    }

    // Create the post
    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      author: user.name, // For backward compatibility
      authorName: user.name,
      userId: identity.subject,
      date: now,
      updatedAt: now,
      category: args.category,
      tags: args.tags,
      slug: args.slug,
      featuredImageUrl: args.featuredImageUrl,
      status: args.status,
    });

    return postId;
  },
});

/**
 * Update an existing post
 * Only the author who created the post can update it
 */
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    slug: v.string(),
    featuredImageUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuthorizedUser(ctx);

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user owns this post (admins can edit any post)
    if (user.role !== "admin" && post.userId !== identity.subject) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    // If slug changed, check if new slug is unique
    if (post.slug !== args.slug) {
      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .unique();

      if (existingPost && existingPost._id !== args.postId) {
        throw new Error(
          `Slug "${args.slug}" is already taken. Please choose a different slug.`
        );
      }
    }

    // Update the post
    await ctx.db.patch(args.postId, {
      title: args.title,
      content: args.content,
      category: args.category,
      tags: args.tags,
      slug: args.slug,
      featuredImageUrl: args.featuredImageUrl,
      status: args.status,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete a post
 * Only the author who created the post can delete it
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity, user } = await requireAuthorizedUser(ctx);

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user owns this post (admins can delete any post)
    if (user.role !== "admin" && post.userId !== identity.subject) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    // Delete the post
    await ctx.db.delete(args.postId);

    return null;
  },
});

/**
 * Publish a draft post
 */
export const publishPost = mutation({
  args: {
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user is admin or approved author
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const isAuthorized =
      user &&
      (user.role === "admin" ||
        (user.role === "author" && user.authorStatus === "approved"));

    if (!isAuthorized) {
      throw new Error(
        "Unauthorized: Only admins or approved authors can publish posts"
      );
    }

    // Check if user owns this post (admins can publish any post)
    if (user.role !== "admin" && post.userId !== identity.subject) {
      throw new Error("Unauthorized: You can only publish your own posts");
    }

    await ctx.db.patch(args.postId, {
      status: "published",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Unpublish a post (change to draft)
 */
export const unpublishPost = mutation({
  args: {
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user is admin or approved author
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const isAuthorized =
      user &&
      (user.role === "admin" ||
        (user.role === "author" && user.authorStatus === "approved"));

    if (!isAuthorized) {
      throw new Error(
        "Unauthorized: Only admins or approved authors can unpublish posts"
      );
    }

    // Check if user owns this post (admins can unpublish any post)
    if (user.role !== "admin" && post.userId !== identity.subject) {
      throw new Error("Unauthorized: You can only unpublish your own posts");
    }

    await ctx.db.patch(args.postId, {
      status: "draft",
      updatedAt: Date.now(),
    });

    return null;
  },
});

// ============================================================================
// NEW QUERIES FOR POST MANAGEMENT
// ============================================================================

/**
 * Get all posts by the current user (both drafts and published)
 */
export const getMyPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
      status: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return posts;
  },
});

/**
 * Get draft posts by the current user
 */
export const getMyDrafts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
      status: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "draft")
      )
      .order("desc")
      .collect();

    return posts;
  },
});

/**
 * Get a post by ID (for editing)
 * Only returns the post if the user owns it
 */
export const getPostById = query({
  args: { postId: v.id("posts") },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      author: v.string(),
      authorName: v.optional(v.string()),
      userId: v.optional(v.string()),
      date: v.number(),
      updatedAt: v.optional(v.number()),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();

    // If post is published, anyone can view it
    if (post.status === "published" || !post.status) {
      return post;
    }

    // If post is draft, only the author can view it
    if (!identity || post.userId !== identity.subject) {
      return null;
    }

    return post;
  },
});

/**
 * Check if a slug is available
 * Useful for real-time validation when creating/editing posts
 */
export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
    excludePostId: v.optional(v.id("posts")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!existingPost) {
      return true; // Slug is available
    }

    // If we're editing an existing post, allow the same slug
    if (args.excludePostId && existingPost._id === args.excludePostId) {
      return true;
    }

    return false; // Slug is taken
  },
});
