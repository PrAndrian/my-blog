export function getPostImageUrl(
  featuredImageUrl: string | null | undefined,
  imageUrl: string | null | undefined
): string | undefined {
  if (!featuredImageUrl) return undefined;
  return featuredImageUrl.startsWith("http")
    ? featuredImageUrl
    : (imageUrl ?? undefined);
}
