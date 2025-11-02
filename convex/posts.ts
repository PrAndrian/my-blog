import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all unique categories from posts
 */
export const getCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const categories = Array.from(new Set(posts.map((post) => post.category)));
    return categories.sort();
  },
});

/**
 * Get posts filtered by category, ordered by date (newest first)
 */
export const getPostsByCategory = query({
  args: { category: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      date: v.number(),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
    return posts;
  },
});

/**
 * Get all posts ordered by date (newest first)
 */
export const getAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      author: v.string(),
      date: v.number(),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
      content: v.string(),
    })
  ),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return posts;
  },
});

/**
 * Get a single post by its slug
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
      date: v.number(),
      category: v.string(),
      tags: v.array(v.string()),
      slug: v.string(),
      featuredImageUrl: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return post;
  },
});
