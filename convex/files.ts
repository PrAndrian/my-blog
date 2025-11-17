import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const FILE_UPLOAD = {
  IMAGE: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  VIDEO: {
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
    ALLOWED_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
  },
} as const;

/**
 * Generate an upload URL for file storage
 * This URL can be used to upload files to Convex storage
 * Requires user to be authenticated and have author role
 * Validates file size and type before allowing upload
 */
export const generateUploadUrl = mutation({
  args: {
    fileSize: v.number(),
    fileType: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: You must be logged in to upload files");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const isAuthorized =
      user &&
      (user.role === "admin" ||
        (user.role === "author" && user.authorStatus === "approved"));

    if (!isAuthorized) {
      throw new Error(
        "Unauthorized: Only admins or approved authors can upload files. Please request author status and wait for approval."
      );
    }

    // Determine file category (image or video)
    const isImage = (
      FILE_UPLOAD.IMAGE.ALLOWED_TYPES as readonly string[]
    ).includes(args.fileType);
    const isVideo = (
      FILE_UPLOAD.VIDEO.ALLOWED_TYPES as readonly string[]
    ).includes(args.fileType);

    if (!isImage && !isVideo) {
      throw new Error(
        `Invalid file type: ${args.fileType}. Allowed types: Images (${FILE_UPLOAD.IMAGE.ALLOWED_TYPES.join(", ")}) or Videos (${FILE_UPLOAD.VIDEO.ALLOWED_TYPES.join(", ")})`
      );
    }

    // Validate file size based on type
    const constraints = isImage ? FILE_UPLOAD.IMAGE : FILE_UPLOAD.VIDEO;
    if (args.fileSize > constraints.MAX_SIZE_BYTES) {
      throw new Error(
        `File size exceeds maximum limit of ${constraints.MAX_SIZE_MB}MB for ${isImage ? "images" : "videos"}. Your file is ${(args.fileSize / (1024 * 1024)).toFixed(2)}MB.`
      );
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get the URL for a stored file
 * This converts a storage ID to a publicly accessible URL
 */
export const getFileUrl = query({
  args: {
    storageId: v.union(v.id("_storage"), v.string()),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return null;
    }

    try {
      const storageId =
        typeof args.storageId === "string"
          ? (args.storageId as Id<"_storage">)
          : args.storageId;
      const url = await ctx.storage.getUrl(storageId);
      return url;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error getting file URL:", error, {
          storageId: args.storageId,
        });
      }
      return null;
    }
  },
});

/**
 * Delete a file from storage
 * Only the author who uploaded it (or owns a post using it) can delete it
 */
export const deleteFile = mutation({
  args: {
    storageId: v.union(v.id("_storage"), v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const isAuthorized =
      user &&
      (user.role === "admin" ||
        (user.role === "author" && user.authorStatus === "approved"));

    if (!isAuthorized) {
      throw new Error(
        "Unauthorized: Only admins or approved authors can delete files"
      );
    }

    if (user.role !== "admin") {
      const postsUsingFile = await ctx.db
        .query("posts")
        .filter((q) => q.eq(q.field("featuredImageUrl"), args.storageId))
        .collect();

      const userOwnsPost = postsUsingFile.some(
        (post) => post.userId === identity.subject
      );

      if (!userOwnsPost && postsUsingFile.length > 0) {
        throw new Error(
          "Unauthorized: You can only delete files that belong to your posts"
        );
      }
    }

    try {
      const storageId =
        typeof args.storageId === "string"
          ? (args.storageId as Id<"_storage">)
          : args.storageId;
      await ctx.storage.delete(storageId);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error deleting file:", error, {
          storageId: args.storageId,
        });
      }
      throw new Error("Failed to delete file");
    }

    return null;
  },
});
