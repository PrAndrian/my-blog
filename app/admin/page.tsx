"use client";

import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { showSuccess, showError } from "@/lib/toast";
import { handleMutationError } from "@/lib/errors";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AuthorRequestSkeleton } from "@/components/admin/AuthorRequestSkeleton";

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminContent />
    </RequireAdmin>
  );
}

function AdminContent() {
  const pendingRequests = useQuery(api.users.getPendingAuthorRequests);
  const approveAuthor = useMutation(api.users.approveAuthor);
  const rejectAuthor = useMutation(api.users.rejectAuthor);

  const [processingId, setProcessingId] = useState<Id<"users"> | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [userToReject, setUserToReject] = useState<Id<"users"> | null>(null);

  const handleApprove = async (userId: Id<"users">) => {
    setProcessingId(userId);
    try {
      await approveAuthor({ userId });
      showSuccess("Author request approved successfully");
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to approve author request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (userId: Id<"users">) => {
    setUserToReject(userId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!userToReject) return;

    setProcessingId(userToReject);
    try {
      await rejectAuthor({ userId: userToReject });
      showSuccess("Author request rejected");
      setUserToReject(null);
    } catch (error) {
      const errorMessage = handleMutationError(error);
      showError(errorMessage || "Failed to reject author request");
    } finally {
      setProcessingId(null);
    }
  };

  // Loading state
  if (pendingRequests === undefined) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage author requests and approvals
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <AuthorRequestSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4" aria-label="Go back to blog">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Blog
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage author requests and approvals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-3xl">{pendingRequests.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
            <p className="text-muted-foreground text-center">
              All author requests have been processed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Pending Author Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.map((request) => (
            <Card key={request._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{request.name}</h3>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDate(request._creationTime)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(request._id)}
                      disabled={processingId === request._id}
                      aria-label={`Approve author request from ${request.name}`}
                    >
                      {processingId === request._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectClick(request._id)}
                      disabled={processingId === request._id}
                      aria-label={`Reject author request from ${request.name}`}
                    >
                      {processingId === request._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        title="Reject Author Request"
        description="Are you sure you want to reject this author request?"
        confirmText="Reject"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}


