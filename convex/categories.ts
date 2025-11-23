import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all categories
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Get a single category by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return category;
  },
});

// Create a new category
export const create = mutation({
  args: {
    slug: v.string(),
    name_en: v.string(),
    name_fr: v.string(),
    section: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Category with this slug already exists");
    }

    await ctx.db.insert("categories", {
      slug: args.slug,
      name_en: args.name_en,
      name_fr: args.name_fr,
      section: args.section,
      redirectUrl: args.redirectUrl,
    });
  },
});

// Update an existing category
export const update = mutation({
  args: {
    id: v.id("categories"),
    slug: v.string(),
    name_en: v.string(),
    name_fr: v.string(),
    section: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error("Category with this slug already exists");
    }

    await ctx.db.patch(args.id, {
      slug: args.slug,
      name_en: args.name_en,
      name_fr: args.name_fr,
      section: args.section,
      redirectUrl: args.redirectUrl,
    });
  },
});

// Delete a category
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
