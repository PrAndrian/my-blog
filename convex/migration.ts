import { mutation } from "./_generated/server";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = [
      {
        slug: "Productivity",
        name_en: "Productivity",
        name_fr: "Productivité",
        section: "Articles",
      },
      { slug: "AI", name_en: "AI", name_fr: "IA", section: "Articles" },
      {
        slug: "Career",
        name_en: "Career",
        name_fr: "Carrière",
        section: "Articles",
      },
      {
        slug: "Job Search",
        name_en: "Job Search",
        name_fr: "Recherche d'emploi",
        section: "Resources",
      },
      {
        slug: "Gear",
        name_en: "Gear",
        name_fr: "Équipement",
        section: "Resources",
      },
      {
        slug: "Templates",
        name_en: "Templates",
        name_fr: "Modèles",
        section: "Resources",
      },
    ];

    for (const cat of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("categories", cat);
      }
    }
  },
});
