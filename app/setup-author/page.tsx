"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/lib/toast";

export default function SetupAuthorPage() {
  const router = useRouter();
  const userRole = useQuery(api.users.getUserRole);
  const requestAuthorStatus = useMutation(api.users.requestAuthorStatus);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // If user is already an approved author or admin, redirect to create post
    if (userRole && (userRole.role === "admin" || (userRole.role === "author" && userRole.authorStatus === "approved"))) {
      router.push("/create-post");
    }
  }, [userRole, router]);

  const handleRequestAuthorStatus = async () => {
    try {
      setIsRequesting(true);
      await requestAuthorStatus({});
      showSuccess("Author access requested successfully!");
    } catch (error) {
      showError("Failed to request author access: " + (error as Error).message);
    } finally {
      setIsRequesting(false);
    }
  };

  // Loading state
  if (userRole === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is not registered yet - show request form
  if (!userRole) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Request Author Access
            </CardTitle>
            <CardDescription>
              Welcome! To create and publish blog posts, you'll need author access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By requesting author access, you'll be able to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Create and publish blog posts</li>
                <li>Edit your existing posts</li>
                <li>Manage your content</li>
                <li>Upload images and media</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                An administrator will review your request. You'll be notified once your account is approved.
              </p>
            </div>
            <Button
              onClick={handleRequestAuthorStatus}
              disabled={isRequesting}
              className="w-full"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Author Access"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User role is "reader" - show request form
  if (userRole.role === "reader" || (userRole.role === "author" && !userRole.authorStatus)) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Request Author Access
            </CardTitle>
            <CardDescription>
              Your account is currently set as a reader. Request author access to start creating content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                As an author, you'll be able to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Create and publish blog posts</li>
                <li>Edit your existing posts</li>
                <li>Manage your content</li>
                <li>Upload images and media</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                An administrator will review your request. You'll be notified once your account is approved.
              </p>
            </div>
            <Button
              onClick={handleRequestAuthorStatus}
              disabled={isRequesting}
              className="w-full"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Author Access"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Author status is pending
  if (userRole.role === "author" && userRole.authorStatus === "pending") {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              Author Request Pending
            </CardTitle>
            <CardDescription>
              Your request for author access is being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your author access request has been submitted and is awaiting administrator approval.
                This usually takes 1-2 business days.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>An administrator will review your profile</li>
                <li>You'll receive a notification once approved</li>
                <li>Once approved, you can immediately start creating posts</li>
              </ul>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Author status is rejected
  if (userRole.role === "author" && userRole.authorStatus === "rejected") {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" />
              Author Request Declined
            </CardTitle>
            <CardDescription>
              Unfortunately, your author access request was not approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Your request for author access has been declined by an administrator.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">What can you do?</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Contact an administrator for more information</li>
                <li>Continue browsing and reading blog posts</li>
                <li>Reapply after addressing any concerns</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestAuthorStatus}
                disabled={isRequesting}
                className="flex-1"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Request Again"
                )}
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Author is approved (shouldn't reach here due to useEffect redirect, but just in case)
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Author Access Approved
          </CardTitle>
          <CardDescription>
            Congratulations! Your author access has been approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              You now have full access to create and manage blog posts.
            </p>
          </div>
          <Button
            onClick={() => router.push("/create-post")}
            className="w-full"
          >
            Create Your First Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
