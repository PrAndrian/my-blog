import type { Id } from "@/convex/_generated/dataModel";

export type PostStatus = "draft" | "published";

export const CATEGORIES = [] as const;

export type PostCategory = string;

export interface PostBase {
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  slug: string;
  featuredImageUrl?: string;
  status: PostStatus;
}

export interface Post extends PostBase {
  _id: Id<"posts">;
  _creationTime: number;
  author: string;
  authorName?: string;
  userId?: string;
  date: number;
  updatedAt?: number;
}

// Type alias for form data - semantically equivalent to PostBase but used in form contexts
export type PostFormData = PostBase;
