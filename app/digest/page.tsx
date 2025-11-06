"use client";

import { DigestNavigationSidebar } from "@/components/digest/DigestNavigationSidebar";
import { DigestContent } from "@/components/digest/DigestContent";
import { DigestList } from "@/components/digest/DigestList";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Database, Menu } from "lucide-react";
import { useState } from "react";

type MobilePanel = "navigation" | "digestList" | "digestContent";

export default function DigestPage() {
  const [selectedDigestId, setSelectedDigestId] = useState<
    Id<"digests"> | null
  >(null);
  const [mobilePanel, setMobilePanel] =
    useState<MobilePanel>("navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch digests
  const digests = useQuery(api.digests.getAllDigests) ?? [];
  const seedDigests = useMutation(api.seed.seedDigests);

  // Get selected digest
  const selectedDigest =
    digests.find((digest) => digest._id === selectedDigestId) ?? null;

  // Handle digest selection
  const handleSelectDigest = (digestId: Id<"digests">) => {
    setSelectedDigestId(digestId);
    setMobilePanel("digestContent");
  };

  // Handle mobile back navigation
  const handleMobileBack = () => {
    if (mobilePanel === "digestContent") {
      setMobilePanel("digestList");
      setSelectedDigestId(null);
    } else if (mobilePanel === "digestList") {
      setMobilePanel("navigation");
    }
  };

  // Handle seeding the database
  const handleSeedDatabase = async () => {
    try {
      await seedDigests();
      alert(
        "Database seeded successfully! Refresh the page to see the digests."
      );
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Error seeding database. Check console for details.");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 border-b bg-background p-4 lg:hidden">
        {mobilePanel !== "navigation" && (
          <Button variant="ghost" size="icon" onClick={handleMobileBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="flex-1 text-xl font-bold">
          {mobilePanel === "navigation" && "AI Tech Digest"}
          {mobilePanel === "digestList" && "All Digests"}
          {mobilePanel === "digestContent" && selectedDigest?.title}
        </h1>
        {mobilePanel === "navigation" && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <DigestNavigationSidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden h-full lg:grid lg:grid-cols-[320px_320px_1fr]">
        {/* Left Panel - Navigation */}
        <DigestNavigationSidebar />

        {/* Middle Panel - Digest List */}
        <DigestList
          digests={digests}
          selectedDigestId={selectedDigestId}
          onSelectDigest={handleSelectDigest}
        />

        {/* Right Panel - Digest Content */}
        {digests.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-background">
            <div className="max-w-2xl p-8 text-center">
              <h1 className="mb-4 text-4xl font-bold">AI Tech Digest</h1>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  No digests found. Click the button below to seed the database
                  with sample digests.
                </p>
                <Button onClick={handleSeedDatabase} size="lg">
                  <Database className="mr-2 h-5 w-5" />
                  Seed Database with Sample Digests
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <DigestContent digest={selectedDigest} />
        )}
      </div>

      {/* Mobile Layout - Single Panel */}
      <div className="h-[calc(100vh-73px)] lg:hidden">
        {mobilePanel === "navigation" && (
          <div className="flex h-full items-center justify-center bg-background p-8">
            <div className="max-w-md text-center">
              <h1 className="mb-4 text-4xl font-bold">AI Tech Digest</h1>
              {digests.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    No digests found. Click the button below to seed the
                    database with sample digests.
                  </p>
                  <Button onClick={handleSeedDatabase} size="lg">
                    <Database className="mr-2 h-5 w-5" />
                    Seed Database
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    View AI-curated digests of the latest in software
                    development.
                  </p>
                  <Button onClick={() => setMobilePanel("digestList")} size="lg">
                    View Digests
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {mobilePanel === "digestList" && (
          <DigestList
            digests={digests}
            selectedDigestId={selectedDigestId}
            onSelectDigest={handleSelectDigest}
          />
        )}

        {mobilePanel === "digestContent" && (
          <DigestContent digest={selectedDigest} />
        )}
      </div>
    </div>
  );
}
