import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate an upload URL for file storage
 * This URL can be used to upload files to Convex storage
 * Requires user to be authenticated and have author role
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: You must be logged in to upload files");
    }

    // Check if user is admin or approved author
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

    // Generate and return upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get the URL for a stored file
 * This converts a storage ID to a publicly accessible URL
 */
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    // Validate that storageId is not empty
    if (!args.storageId) {
      return null;
    }

    try {
      // Get URL from storage ID
      const url = await ctx.storage.getUrl(args.storageId as any);
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
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
    storageId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if user is admin or approved author
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const isAuthorized =
      user &&
      (user.role === "admin" ||
        (user.role === "author" && user.authorStatus === "approved"));

    if (!isAuthorized) {
      throw new Error("Unauthorized: Only admins or approved authors can delete files");
    }

    // Delete the file from storage
    try {
      await ctx.storage.delete(args.storageId as any);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }

    return null;
  },
});
