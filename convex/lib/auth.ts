import { QueryCtx, MutationCtx } from "../_generated/server";

export interface AuthorizedUser {
  identity: {
    subject: string;
    email?: string;
    name?: string;
  };
  user: {
    _id: string;
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
    .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
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

