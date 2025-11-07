import type { Metadata } from "next";

interface BlogPost {
  title: string;
  content: string;
  authorName?: string;
  date: number;
  category: string;
  tags: string[];
  featuredImageUrl?: string;
  slug: string;
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
  const url = `${siteUrl}/blog/${post.slug}`;
  const description = post.content
    .replace(/[#*`]/g, "")
    .substring(0, 160)
    .trim();
  const imageUrl = post.featuredImageUrl
    ? post.featuredImageUrl.startsWith("http")
      ? post.featuredImageUrl
      : `${siteUrl}${post.featuredImageUrl}`
    : undefined;

  return {
    title: post.title,
    description: description || `Read ${post.title} on ${siteName}`,
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: description || `Read ${post.title} on ${siteName}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description || `Read ${post.title} on ${siteName}`,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function getBlogPostStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.content
      .replace(/[#*`]/g, "")
      .substring(0, 160)
      .trim(),
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
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    image: post.featuredImageUrl
      ? post.featuredImageUrl.startsWith("http")
        ? post.featuredImageUrl
        : `${siteUrl}${post.featuredImageUrl}`
      : undefined,
    articleSection: post.category,
    keywords: post.tags.join(", "),
  };
}

