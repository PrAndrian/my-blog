import type { Id } from "@/convex/_generated/dataModel";

export type PostStatus = "draft" | "published";

export const CATEGORIES = [
  "Productivity",
  "AI",
  "Career",
  "Gear",
  "Technology",
  "Design",
  "Business",
  "Personal",
] as const;

export type PostCategory = typeof CATEGORIES[number];

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

export interface PostFormData extends PostBase {
  // Form-specific, no ID needed
}

