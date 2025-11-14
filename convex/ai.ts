/**
 * AI-powered SEO metadata generation using OpenAI GPT-4
 *
 * This module provides actions for generating SEO-optimized metadata
 * for blog posts using AI. The generated metadata is narrative, human-friendly,
 * and optimized for both search engines and AI recommendation systems.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

/**
 * Detect the language of the content
 * Returns: 'french', 'english', or 'auto'
 */
function detectLanguage(text: string): "french" | "english" {
  // Simple heuristic: look for common French words/characters
  const frenchIndicators = [
    "est",
    "dans",
    "pour",
    "avec",
    "être",
    "avoir",
    "à",
    "où",
    "ça",
    "français",
  ];
  const lowerText = text.toLowerCase();

  const frenchMatches = frenchIndicators.filter((word) =>
    lowerText.includes(word)
  ).length;

  // If we find multiple French indicators, assume French
  return frenchMatches >= 3 ? "french" : "english";
}

/**
 * Generate SEO metadata for a blog post using AI
 *
 * This action calls OpenAI GPT-4 with a specialized prompt to generate:
 * - title: Reformulated, SEO-optimized title
 * - meta_description: Narrative description (150-180 chars)
 * - keywords: 6-12 relevant keywords
 * - og_title: Direct, impactful Open Graph title
 * - og_description: Short storytelling version
 * - image_suggestion: Idea for featured image
 */
export const generateSEOMetadata = action({
  args: {
    slug: v.string(),
    title: v.optional(v.string()),
    content: v.string(),
    pageType: v.optional(v.union(v.literal("blog"), v.literal("présentation"))),
  },
  returns: v.object({
    title: v.string(),
    meta_description: v.string(),
    keywords: v.array(v.string()),
    og_title: v.string(),
    og_description: v.string(),
    image_suggestion: v.string(),
  }),
  handler: async (ctx, args) => {
    const { slug, title, content, pageType = "blog" } = args;

    // Initialize OpenAI client with API key from environment
    // The API key is stored in Convex environment variables (dashboard)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Detect language from content
    const language = detectLanguage(content);

    // Build the AI prompt based on the French specification
    const systemPrompt = `Rôle du modèle :
Tu es un assistant spécialisé en SEO narratif et en génération de métadonnées pour un site web moderne. Tes objectifs sont : améliorer la lisibilité, renforcer la cohérence, optimiser le référencement, et créer une impression qui plaise autant aux humains qu'aux systèmes d'IA recommandant des pages web.

Entrée fournie :
– le slug de la page
– le contenu du post en markdown (avec texte, sections, code, image principale, etc.)
– le titre original s'il existe dans le markdown
– le type de page : "blog" ou "présentation"

Ta mission :
À partir de ces éléments, génère un ensemble structuré de métadonnées :

title : reformule le titre existant pour le rendre plus clair, plus attractif et légèrement optimisé SEO. Tu peux proposer un titre complètement différent uniquement si le contenu le justifie (meilleure intention, meilleur angle, meilleure compréhension).

meta_description : crée une description narrative, humaine, évocatrice, qui explique ce que la page apporte. Ton objectif : qu'elle donne envie, qu'elle transmette une émotion, et qu'elle soit interprétable et recommandable par des IA génératives. 150–180 caractères maximum.

keywords : liste 6 à 12 mots-clés cohérents avec le sujet, le ton et l'objectif de la page.

og_title : version plus directe et plus impactante du title.

og_description : courte version "storytelling instantané" du meta description.

image_suggestion : si une image existe dans le markdown, résume son sujet. Sinon, propose une idée d'image simple qui représente le contenu.

Contraintes :
– Pas de keyword stuffing.
– Ton écriture doit être naturelle, précise et légèrement imagée.
– Tu ignores les parties de code ou les sections techniques qui n'aident pas au sens global.
– Tu dois comprendre l'intention générale de la page avant de formuler le titre et la description.
– N'invente jamais de faits qui ne sont pas dans le contenu.
– Sors le résultat sous forme JSON propre.
– IMPORTANT: Génère le contenu dans la langue détectée du post (${language === "french" ? "français" : "anglais"}).

Format de sortie attendu :

{
  "title": "...",
  "meta_description": "...",
  "keywords": ["...", "..."],
  "og_title": "...",
  "og_description": "...",
  "image_suggestion": "..."
}`;

    const userPrompt = `Slug de la page: ${slug}
Type de page: ${pageType}
${title ? `Titre original: ${title}` : ""}

Contenu du post (markdown):
${content}

Génère maintenant les métadonnées SEO optimisées en JSON.`;

    try {
      // Call OpenAI GPT-4
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7, // Slightly creative for narrative descriptions
        response_format: { type: "json_object" }, // Ensure JSON response
      });

      const responseContent = completion.choices[0]?.message?.content;

      if (!responseContent) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      const metadata = JSON.parse(responseContent);

      // Validate the response structure
      if (
        !metadata.title ||
        !metadata.meta_description ||
        !metadata.keywords ||
        !metadata.og_title ||
        !metadata.og_description ||
        !metadata.image_suggestion
      ) {
        throw new Error("Invalid metadata structure from AI");
      }

      // Ensure meta_description is within character limits (150-180)
      if (metadata.meta_description.length > 180) {
        metadata.meta_description =
          metadata.meta_description.substring(0, 177) + "...";
      }

      return {
        title: metadata.title,
        meta_description: metadata.meta_description,
        keywords: Array.isArray(metadata.keywords) ? metadata.keywords : [],
        og_title: metadata.og_title,
        og_description: metadata.og_description,
        image_suggestion: metadata.image_suggestion,
      };
    } catch (error) {
      console.error("Error generating SEO metadata:", error);

      // Return fallback metadata if AI fails
      return {
        title:
          title ||
          slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        meta_description:
          content.substring(0, 160).replace(/[#*`]/g, "").trim() + "...",
        keywords: [],
        og_title: title || slug.replace(/-/g, " "),
        og_description: content.substring(0, 120).replace(/[#*`]/g, "").trim(),
        image_suggestion: "Article illustration related to: " + (title || slug),
      };
    }
  },
});
