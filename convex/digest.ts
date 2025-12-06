import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { DIGEST_CONFIG } from "./digestConfig";

// Default configuration fallback
const DEFAULT_CONFIG = {
  newsApiEndpoint: DIGEST_CONFIG.newsApi.endpoint,
  newsApiParams: JSON.stringify(DIGEST_CONFIG.newsApi.params),
  aiSystemPrompt: DIGEST_CONFIG.prompt.system,
  scheduleDay: "Monday",
  enabled: true,
};

// Get the current digest configuration
export const getDigestConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("digestConfig").first();
    return config || DEFAULT_CONFIG;
  },
});

// Save or update the digest configuration
export const saveDigestConfig = mutation({
  args: {
    newsApiEndpoint: v.string(),
    newsApiParams: v.string(),
    aiSystemPrompt: v.string(),
    scheduleDay: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("digestConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("digestConfig", args);
    }
  },
});

// Internal mutation to save the generated post
export const saveDigestPost = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check if category exists, create if not
    const categorySlug = DIGEST_CONFIG.category.slug;
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("categories", {
        slug: categorySlug,
        name_en: DIGEST_CONFIG.category.name_en,
        name_fr: DIGEST_CONFIG.category.name_fr,
        section: DIGEST_CONFIG.category.section,
      });
    }

    // 2. Create the post
    await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      slug: args.slug,
      category: categorySlug,
      date: Date.now(),
      tags: ["Digest", "News", "AI"],
      author: "AI Digest", // Legacy field
      authorName: "AI Digest Bot",
      status: "published",
      language: "fr", // Default to French as requested
      seo_title: args.title,
      meta_description: `Digest hebdomadaire généré par IA : ${args.title}`,
    });
  },
});

// Internal query to get config for action
export const getDigestConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("digestConfig").first();
    return config || DEFAULT_CONFIG;
  },
});

// Action to generate the digest
export const generateWeeklyDigest = action({
  // Add force parameter to manually trigger even if disabled or wrong day
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    console.log("Starting digest generation process...");

    // 1. Load configuration
    const config = await ctx.runQuery(internal.digest.getDigestConfigInternal);

    // 2. Check if enabled
    if (!config.enabled && !args.force) {
      console.log("Digest generation is disabled. Skipping.");
      return;
    }

    // 3. Check schedule day
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = days[new Date().getDay()];

    // Case-insensitive comparison
    if (
      config.scheduleDay.toLowerCase() !== today.toLowerCase() &&
      !args.force
    ) {
      console.log(
        `Today is ${today}, but schedule is for ${config.scheduleDay}. Skipping.`
      );
      return;
    }

    console.log("Proceeding with digest generation (News API)...");

    const apiKey = process.env.NEWSAPI_API_KEY;
    if (!apiKey) {
      console.error("NEWSAPI_API_KEY is missing in environment variables.");
      throw new Error("NEWSAPI_API_KEY is missing");
    }

    // 4. Fetch from News API using configured params
    interface NewsArticle {
      source: { id: string | null; name: string };
      author: string | null;
      title: string;
      description: string | null;
      url: string;
      urlToImage: string | null;
      publishedAt: string;
      content: string | null;
    }

    const endpoint = config.newsApiEndpoint;
    let params: Record<string, any>;
    try {
      params = JSON.parse(config.newsApiParams);
    } catch (e) {
      console.error("Failed to parse newsApiParams, using defaults");
      params = DIGEST_CONFIG.newsApi.params;
    }

    // Construct URL with query parameters
    const url = new URL(endpoint);
    url.searchParams.append("apiKey", apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    let articles: NewsArticle[] = [];

    try {
      console.log(
        `Fetching news from ${url.toString().replace(apiKey, "HIDDEN")}...`
      );
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `News API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error(`News API returned error status: ${data.message}`);
      }

      articles = data.articles || [];
      console.log(`Fetched ${articles.length} articles.`);
    } catch (error) {
      console.error("Error fetching from News API:", error);
      // Don't throw here if we want to try generating with empty or partial data,
      // but for now let's stop if we can't get news.
      throw error;
    }

    if (articles.length === 0) {
      console.log("No articles found. Skipping digest generation.");
      return;
    }

    // 5. Prepare prompt for OpenAI using configured prompt
    const newsContext = articles
      .map(
        (item) =>
          `- [${item.source.name}] ${item.title}: ${item.description || "Pas de description"} (${item.url})`
      )
      .join("\n");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      console.log("Calling OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: config.aiSystemPrompt },
          {
            role: "user",
            content: `Voici les actualités de la semaine :\n\n${newsContext}\n\nCrée le Digest.`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No content generated");

      // Generate a title
      const titleCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Génère un titre court et accrocheur pour ce digest hebdomadaire. Juste le titre, rien d'autre.",
          },
          { role: "user", content: content },
        ],
      });
      const title =
        titleCompletion.choices[0]?.message?.content
          ?.replace(/"/g, "")
          .trim() || `Digest du ${new Date().toLocaleDateString()}`;

      // Create a unique slug (date + timestamp to avoid duplicates)
      const slug = `digest-${new Date().toISOString().split("T")[0]}-${Date.now()}`;

      // 6. Save to DB
      await ctx.runMutation(internal.digest.saveDigestPost, {
        title,
        content,
        slug,
      });

      console.log("Digest generated and saved successfully.");
    } catch (error) {
      console.error("Error generating digest with OpenAI:", error);
      throw error;
    }
  },
});
