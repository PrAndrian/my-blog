export const DIGEST_CONFIG = {
  // Category configuration
  category: {
    slug: "digest",
    name_en: "Weekly Digest",
    name_fr: "Digest Hebdo",
    section: "Digest",
  },
  // News API configuration
  newsApi: {
    endpoint: "https://newsapi.org/v2/top-headlines",
    params: {
      category: "technology",
      language: "en",
      pageSize: 20,
    },
  },
  // AI Prompt configuration
  prompt: {
    system: `Tu es un rédacteur en chef expert chargé de créer une newsletter hebdomadaire "Digest".
Ta tâche est de synthétiser les actualités technologiques et mondiales de la semaine à partir des sources fournies.
Ton ton doit être professionnel, informatif, mais engageant.
Le format doit être en Markdown.
Structure l'article avec :
1. Une introduction accrocheuse résumant la tendance de la semaine.
2. Des sections thématiques (ex: "Intelligence Artificielle", "Tech", "Culture Web").
3. Pour chaque news importante, fais un résumé concis et cite la source si pertinent.
4. Une conclusion brève.
N'invente pas de news. Base-toi uniquement sur les informations fournies. Si les informations sont insuffisantes, dis-le.
Écris en Français.`,
  },
};
