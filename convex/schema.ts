// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    documents: defineTable({
      fieldOne: v.string(),
      fieldTwo: v.object({
        subFieldOne: v.array(v.number()),
      }),
    }),
    // This definition matches the example query and mutation code:
    numbers: defineTable({
      value: v.number(),
    }),
    // Blog posts table
    posts: defineTable({
      title: v.string(),
      content: v.string(), // Markdown content
      author: v.string(),
      date: v.number(), // Timestamp
      category: v.string(),
      tags: v.array(v.string()),
      featuredImageUrl: v.optional(v.string()),
      slug: v.string(),
    })
      .index("by_category", ["category"])
      .index("by_slug", ["slug"])
      .index("by_date", ["date"]),
    // AI Tech Digests table
    digests: defineTable({
      title: v.string(),
      summary: v.string(), // Short summary of the digest
      content: v.string(), // Full markdown content
      date: v.number(), // Timestamp
      tags: v.array(v.string()),
      articles: v.array(
        v.object({
          title: v.string(),
          source: v.string(),
          url: v.string(),
          summary: v.string(),
        })
      ),
      slug: v.string(),
    })
      .index("by_date", ["date"])
      .index("by_slug", ["slug"]),
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
