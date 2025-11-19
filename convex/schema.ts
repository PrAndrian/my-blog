// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    // Blog posts table
    posts: defineTable({
      title: v.string(),
      content: v.string(), // Markdown content
      author: v.string(), // Kept for backward compatibility
      authorName: v.optional(v.string()), // Display name of author
      userId: v.optional(v.string()), // Clerk user ID of author
      date: v.number(), // Timestamp (creation date)
      updatedAt: v.optional(v.number()), // Last modified timestamp
      category: v.string(),
      tags: v.array(v.string()),
      featuredImageUrl: v.optional(v.string()), // URL or Convex storage ID
      slug: v.string(),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"))), // "draft" or "published" (default to "published" for backward compatibility)
      // Multilingual fields
      language: v.optional(v.string()), // Language code (e.g., "en", "fr") - defaults to "en" if not set
      translationId: v.optional(v.string()), // UUID to link translations of the same post
      // SEO metadata fields
      seo_title: v.optional(v.string()), // Optional SEO-optimized title override
      meta_description: v.optional(v.string()), // Narrative description for SEO (150-180 chars)
      og_image_url: v.optional(v.string()), // Custom OpenGraph image URL
    })
      .index("by_category", ["category"])
      .index("by_slug", ["slug"])
      .index("by_date", ["date"])
      .index("by_userId", ["userId"])
      .index("by_status", ["status"])
      .index("by_userId_and_status", ["userId", "status"])
      .index("by_category_and_status", ["category", "status"])
      .index("by_language", ["language"])
      .index("by_translationId", ["translationId"])
      .index("by_language_and_status", ["language", "status"]),
    // Users table for role management
    users: defineTable({
      userId: v.string(), // Clerk user ID
      role: v.union(
        v.literal("admin"),
        v.literal("author"),
        v.literal("reader")
      ), // "admin", "author", or "reader"
      authorStatus: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        )
      ), // Approval status for authors
      name: v.string(),
      email: v.string(),
    })
      .index("by_userId", ["userId"])
      .index("by_role", ["role"])
      .index("by_authorStatus", ["authorStatus"]),
    // Categories table
    categories: defineTable({
      slug: v.string(),
      name_en: v.string(),
      name_fr: v.string(),
      section: v.optional(v.string()), // Group categories into sections (e.g., "Articles", "Resources", "Efficy Labs")
    })
      .index("by_slug", ["slug"])
      .index("by_section", ["section"]),
  },
  // If you ever get an error about schema mismatch
  // between your data and your schema, and you cannot
  // change the schema to match the current data in your database,
  // you can:
  //  1. Use the dashboard to delete tables or individual documents
  //     that are causing the error.
  //  2. Change this option to `false` and make changes to the data
  //     freely, ignoring the schema. Don't forget to change back to `true`!
  { schemaValidation: true }
);
