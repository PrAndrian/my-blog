"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ANIMATION } from "@/lib/constants";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export function PostContentSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set([headerRef.current, imageRef.current, contentRef.current], {
        opacity: 1,
        y: 0,
      });
      return;
    }

    const tl = gsap.timeline();

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.DURATION_SHORT,
          ease: "power2.out",
        }
      );
    }

    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.DURATION_SHORT,
          ease: "power2.out",
        },
        "-=0.1"
      );
    }

    if (contentRef.current) {
      const lines = contentRef.current.querySelectorAll(".skeleton-line");
      tl.fromTo(
        lines,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.DURATION_SHORT,
          ease: "power2.out",
          stagger: 0.05,
        },
        "-=0.1"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <ScrollArea className="h-full bg-background overflow-x-hidden">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-full md:max-w-4xl px-4 md:px-6 py-8"
      >
        <header ref={headerRef} className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </header>
        <Separator className="mb-8" />
        <div ref={imageRef}>
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
        </div>
        <div ref={contentRef} className="space-y-4">
          <Skeleton className="h-4 w-full skeleton-line" />
          <Skeleton className="h-4 w-full skeleton-line" />
          <Skeleton className="h-4 w-5/6 skeleton-line" />
          <Skeleton className="h-4 w-full skeleton-line" />
          <Skeleton className="h-4 w-4/5 skeleton-line" />
          <Skeleton className="h-4 w-full skeleton-line" />
          <Skeleton className="h-4 w-3/4 skeleton-line" />
        </div>
      </div>
    </ScrollArea>
  );
}
