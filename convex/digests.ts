import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all digests ordered by date (newest first)
export const getAllDigests = query({
  args: {},
  handler: async (ctx) => {
    const digests = await ctx.db
      .query("digests")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return digests;
  },
});

// Get a single digest by slug
export const getDigestBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const digest = await ctx.db
      .query("digests")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
    return digest;
  },
});

// Get recent digests (limited)
export const getRecentDigests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const digests = await ctx.db
      .query("digests")
      .withIndex("by_date")
      .order("desc")
      .take(limit);
    return digests;
  },
});
