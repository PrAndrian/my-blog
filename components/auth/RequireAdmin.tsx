"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
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
        <AdminCheck>{children}</AdminCheck>
      </Authenticated>
    </>
  );
}

function AdminCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useQuery(api.users.isAdmin);

  useEffect(() => {
    if (isAdmin === false) {
      // User is not an admin, redirect to home
      router.push("/blog");
    }
  }, [isAdmin, router]);

  // Loading state
  if (isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access this page. Only administrators can view this content.
        </p>
        <Button onClick={() => router.push("/blog")}>Go to Blog</Button>
      </div>
    );
  }

  // User is an admin, show the content
  return <>{children}</>;
}


