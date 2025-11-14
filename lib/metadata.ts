import type { Metadata } from "next";

/**
 * Generate keywords from content and meta description
 * This is a simple implementation that extracts important words
 * For production, you might want to use a more sophisticated NLP approach
 */
export function generateKeywords(
  content: string,
  metaDescription?: string,
  tags?: string[]
): string[] {
  // Combine all text sources
  const textToAnalyze = [
    metaDescription || "",
    content.substring(0, 500), // Only analyze first 500 chars of content
  ].join(" ");

  // Remove markdown syntax and special characters
  const cleanText = textToAnalyze
    .replace(/[#*`\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  // Split into words
  const words = cleanText.split(/\s+/);

  // Common stop words to exclude
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "just",
    "don",
    "now",
    "use",
    "using",
    "used",
  ]);

  // Count word frequency (excluding stop words and short words)
  const wordCount: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  // Sort by frequency and take top words
  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  // Combine with tags (if provided) and deduplicate
  const allKeywords = [
    ...new Set([...(tags || []).map((t) => t.toLowerCase()), ...topWords]),
  ];

  return allKeywords.slice(0, 12); // Max 12 keywords
}

interface BlogPost {
  title: string;
  content: string;
  authorName?: string;
  date: number;
  category: string;
  tags: string[];
  featuredImageUrl?: string;
  slug: string;
  updatedAt?: number;
  // SEO metadata fields
  seo_title?: string;
  meta_description?: string;
  og_image_url?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "My Blog";
const siteDescription = "A modern blog platform";

export function getDefaultMetadata(): Metadata {
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName,
      title: siteName,
      description: siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
  };
}

export function getBlogPostMetadata(post: BlogPost): Metadata {
  const url = `${siteUrl}/${post.slug}`;

  // Use meta_description if available, otherwise extract from content
  const description =
    post.meta_description ||
    post.content.replace(/[#*`]/g, "").substring(0, 160).trim();

  // Use og_image_url if available, otherwise fall back to featuredImageUrl
  const imageUrl =
    post.og_image_url || post.featuredImageUrl
      ? (post.og_image_url || post.featuredImageUrl!).startsWith("http")
        ? post.og_image_url || post.featuredImageUrl!
        : `${siteUrl}${post.og_image_url || post.featuredImageUrl}`
      : undefined;

  // Use seo_title if available, otherwise use regular title
  const seoTitle = post.seo_title || post.title;

  return {
    title: seoTitle,
    description: description || `Read ${post.title} on ${siteName}`,
    openGraph: {
      type: "article",
      url,
      title: seoTitle,
      description: description || `Read ${post.title} on ${siteName}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: description || `Read ${post.title} on ${siteName}`,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function getBlogPostStructuredData(post: BlogPost) {
  // Use meta_description if available, otherwise extract from content
  const description =
    post.meta_description ||
    post.content.replace(/[#*`]/g, "").substring(0, 160).trim();

  // Use og_image_url if available, otherwise fall back to featuredImageUrl
  const imageUrl =
    post.og_image_url || post.featuredImageUrl
      ? (post.og_image_url || post.featuredImageUrl!).startsWith("http")
        ? post.og_image_url || post.featuredImageUrl!
        : `${siteUrl}${post.og_image_url || post.featuredImageUrl}`
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo_title || post.title,
    description,
    author: {
      "@type": "Person",
      name: post.authorName || "Unknown Author",
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : new Date(post.date).toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/${post.slug}`,
    },
    image: imageUrl,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };
}
