import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export interface AuthorizedUser {
  identity: {
    subject: string;
    email?: string;
    name?: string;
  };
  user: {
    _id: Id<"users">;
    userId: string;
    role: "admin" | "author" | "reader";
    authorStatus?: "pending" | "approved" | "rejected";
    name: string;
    email: string;
  };
}

export async function requireAuthorizedUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthorizedUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: You must be logged in to perform this action");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  const isAuthorized =
    user.role === "admin" ||
    (user.role === "author" && user.authorStatus === "approved");

  if (!isAuthorized) {
    throw new Error(
      "Unauthorized: Only admins or approved authors can perform this action"
    );
  }

  return { identity, user };
}

/**
 * Require that the current user is an admin
 * Throws an error if not authenticated or not an admin
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<AuthorizedUser> {
  const { user, identity } = await requireAuthorizedUser(ctx);

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return { identity, user };
}

/**
 * Require that the current user is an author or admin
 * Throws an error if not authenticated, not an author/admin, or not approved
 */
export async function requireAuthor(
  ctx: QueryCtx | MutationCtx
): Promise<AuthorizedUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: You must be logged in to perform this action");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  const isAuthor =
    user.role === "admin" ||
    (user.role === "author" && user.authorStatus === "approved");

  if (!isAuthor) {
    throw new Error(
      "Forbidden: Author access required. Please request author status if you haven't already."
    );
  }

  return { identity, user };
}

