"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface RequireAuthorProps {
  children: React.ReactNode;
}

export function RequireAuthor({ children }: RequireAuthorProps) {
  return (
    <>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            You need to be signed in to access this page.
          </p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </Unauthenticated>
      <Authenticated>
        <AuthorCheck>{children}</AuthorCheck>
      </Authenticated>
    </>
  );
}

function AuthorCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userRole = useQuery(api.users.getUserRole);
  const canPerformAuthorActions = useQuery(api.users.canPerformAuthorActions);

  useEffect(() => {
    if (userRole === null) {
      // User is authenticated but not registered, redirect to setup
      router.push("/setup-author");
    } else if (userRole && userRole.role === "admin") {
      // Admin can access, no redirect needed
      return;
    } else if (userRole && userRole.role !== "author") {
      // User is registered but not an author
      router.push("/setup-author");
    } else if (userRole && userRole.role === "author" && userRole.authorStatus !== "approved") {
      // User is an author but not approved (pending or rejected)
      router.push("/setup-author");
    }
  }, [userRole, router]);

  // Loading state
  if (userRole === undefined || canPerformAuthorActions === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if user can perform author actions (admin or approved author)
  if (!canPerformAuthorActions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is admin or approved author, show the content
  return <>{children}</>;
}
