import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Register or update a user with their role
 * Users can self-register as readers, or this can be called by admins
 */
export const setUserRole = mutation({
  args: {
    role: v.union(v.literal("author"), v.literal("reader")),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;
    const name = identity.name ?? "Unknown";
    const email = identity.email ?? "";

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingUser) {
      // Update existing user's role
      await ctx.db.patch(existingUser._id, {
        role: args.role,
        name,
        email,
      });
      return existingUser._id;
    } else {
      // Create new user
      const id = await ctx.db.insert("users", {
        userId,
        role: args.role,
        name,
        email,
      });
      return id;
    }
  },
});

/**
 * Request author status (sets role to "author" with status "pending")
 * Users request author status and wait for admin approval
 */
export const requestAuthorStatus = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;
    const name = identity.name ?? "Unknown";
    const email = identity.email ?? "";

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingUser) {
      // Update existing user to request author status
      await ctx.db.patch(existingUser._id, {
        role: "author",
        authorStatus: "pending",
        name,
        email,
      });
      return existingUser._id;
    } else {
      // Create new user with pending author status
      const id = await ctx.db.insert("users", {
        userId,
        role: "author",
        authorStatus: "pending",
        name,
        email,
      });
      return id;
    }
  },
});

/**
 * Approve a pending author request (admin only)
 */
export const approveAuthor = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if current user is admin
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can approve author requests");
    }

    // Get the user to approve
    const userToApprove = await ctx.db.get(args.userId);
    if (!userToApprove) {
      throw new Error("User not found");
    }

    if (userToApprove.role !== "author") {
      throw new Error("User is not an author");
    }

    // Approve the author
    await ctx.db.patch(args.userId, {
      authorStatus: "approved",
    });

    return null;
  },
});

/**
 * Reject a pending author request (admin only)
 */
export const rejectAuthor = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if current user is admin
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized: Only admins can reject author requests");
    }

    // Get the user to reject
    const userToReject = await ctx.db.get(args.userId);
    if (!userToReject) {
      throw new Error("User not found");
    }

    if (userToReject.role !== "author") {
      throw new Error("User is not an author");
    }

    // Reject the author
    await ctx.db.patch(args.userId, {
      authorStatus: "rejected",
    });

    return null;
  },
});

/**
 * Set yourself as admin (only works if no admins exist - for initial setup)
 * This is a one-time setup function for the first admin
 */
export const setMyselfAsAdmin = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if any admins already exist
    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (existingAdmins.length > 0) {
      throw new Error(
        "Admins already exist. Only the first admin can be set this way."
      );
    }

    // Get or create current user
    const userId = identity.subject;
    const name = identity.name ?? "Unknown";
    const email = identity.email ?? "";

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingUser) {
      // Update existing user to admin
      await ctx.db.patch(existingUser._id, {
        role: "admin",
        name,
        email,
      });
    } else {
      // Create new user as admin
      await ctx.db.insert("users", {
        userId,
        role: "admin",
        name,
        email,
      });
    }

    return null;
  },
});

/**
 * Set a user as admin (protected, only for initial setup)
 * This should be called manually or through a one-time setup function
 */
export const setAdminRole = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if current user is admin (or if no admins exist, allow first admin creation)
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    // Allow if no admins exist (initial setup) or if current user is admin
    if (
      existingAdmins.length > 0 &&
      (!adminUser || adminUser.role !== "admin")
    ) {
      throw new Error("Unauthorized: Only admins can set admin role");
    }

    // Set the user as admin
    await ctx.db.patch(args.userId, {
      role: "admin",
    });

    return null;
  },
});

/**
 * Get the current user's role
 * Returns null if user is not authenticated or not registered
 */
export const getUserRole = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      userId: v.string(),
      role: v.string(),
      authorStatus: v.optional(v.string()),
      name: v.string(),
      email: v.string(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      role: user.role,
      authorStatus: user.authorStatus,
      name: user.name,
      email: user.email,
    };
  },
});

/**
 * Check if the current user is an author
 * Returns false if user is not authenticated, not an author, or not approved
 */
export const isAuthor = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    return user?.role === "author" && user?.authorStatus === "approved";
  },
});

/**
 * Check if the current user can perform author actions
 * Returns true if user is admin OR approved author
 */
export const canPerformAuthorActions = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Admin can always perform author actions
    if (user.role === "admin") {
      return true;
    }

    // Approved authors can perform author actions
    return user.role === "author" && user.authorStatus === "approved";
  },
});

/**
 * Check if the current user is an admin
 * Returns false if user is not authenticated or not an admin
 */
export const isAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    return user?.role === "admin";
  },
});

/**
 * Get current user's full information
 * Returns null if user is not authenticated or not registered
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      userId: v.string(),
      role: v.string(),
      authorStatus: v.optional(v.string()),
      name: v.string(),
      email: v.string(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Get all pending author requests (admin only)
 */
export const getPendingAuthorRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      userId: v.string(),
      name: v.string(),
      email: v.string(),
      authorStatus: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Check if current user is admin
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!adminUser || adminUser.role !== "admin") {
      return [];
    }

    // Get all users with pending author status
    const pendingUsers = await ctx.db
      .query("users")
      .withIndex("by_authorStatus", (q) => q.eq("authorStatus", "pending"))
      .collect();

    return pendingUsers.map((user) => ({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      authorStatus: user.authorStatus,
      _creationTime: user._creationTime,
    }));
  },
});

/**
 * Get all authors (for admin purposes)
 */
export const getAllAuthors = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      userId: v.string(),
      name: v.string(),
      email: v.string(),
    })
  ),
  handler: async (ctx) => {
    const authors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "author"))
      .collect();

    return authors.map((author) => ({
      _id: author._id,
      userId: author.userId,
      name: author.name,
      email: author.email,
    }));
  },
});
