"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface DigestListProps {
  digests: Doc<"digests">[];
  selectedDigestId: Id<"digests"> | null;
  onSelectDigest: (digestId: Id<"digests">) => void;
}

export function DigestList({
  digests,
  selectedDigestId,
  onSelectDigest,
}: DigestListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-[calc(100%-1rem)] flex-col border-r bg-background my-2 mr-2 border-y rounded-r-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">AI Tech Digests</h2>
            <p className="text-sm text-muted-foreground">
              {digests.length} {digests.length === 1 ? "digest" : "digests"}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Digests list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {digests.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No digests available yet.
              </p>
            </div>
          ) : (
            digests.map((digest) => (
              <Card
                key={digest._id}
                className={`cursor-pointer p-4 transition-colors hover:bg-accent ${
                  selectedDigestId === digest._id
                    ? "border-primary bg-accent"
                    : ""
                }`}
                onClick={() => onSelectDigest(digest._id)}
              >
                <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">
                  {digest.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{formatDate(digest.date)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {digest.articles.length} articles
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {digest.summary}
                </p>
                {digest.tags && digest.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {digest.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {digest.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{digest.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
