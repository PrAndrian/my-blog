"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { ANIMATION } from "@/lib/constants";
import { getPostImageUrl } from "@/lib/postUtils";
import { formatDate } from "@/lib/utils";
import { useQuery } from "convex/react";
import { gsap } from "gsap";
import "highlight.js/styles/github.css";
import Image from "next/image";
import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { PostContentSkeleton } from "./PostContentSkeleton";

interface PostContentProps {
  post: Doc<"posts"> | null;
  isLoading?: boolean;
}

export function PostContent({ post, isLoading }: PostContentProps) {
  const articleRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const skeletonRef = useRef<HTMLDivElement>(null);

  // Convert Convex storage ID to URL if needed
  const imageUrl = useQuery(
    api.files.getFileUrl,
    post?.featuredImageUrl ? { storageId: post.featuredImageUrl } : "skip"
  );

  // Determine the actual image URL to display (calculate before early returns)
  const displayImageUrl = post
    ? getPostImageUrl(post.featuredImageUrl, imageUrl)
    : null;

  // Reset image loaded state when post or image URL changes
  useEffect(() => {
    setImageLoaded(false);
  }, [post?._id, displayImageUrl]);

  // Smooth transition from skeleton to image when image loads
  useEffect(() => {
    if (imageLoaded && skeletonRef.current && imageRef.current) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(skeletonRef.current, { opacity: 0 });
        gsap.set(imageRef.current, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline();

      // Fade out skeleton
      tl.to(skeletonRef.current, {
        opacity: 0,
        duration: ANIMATION.DURATION_SHORT,
        ease: "power2.out",
      });

      // Fade in image
      tl.to(
        imageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: ANIMATION.DURATION_SHORT,
          ease: "power2.out",
        },
        "-=0.1"
      );

      return () => {
        tl.kill();
      };
    }
  }, [imageLoaded]);

  // Staggered animations for post content sections
  useEffect(() => {
    if (post && articleRef.current) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        const elementsToSet = [headerRef.current, contentRef.current];
        if (imageRef.current && displayImageUrl) {
          elementsToSet.push(imageRef.current);
        }
        if (skeletonRef.current && displayImageUrl && !imageLoaded) {
          elementsToSet.push(skeletonRef.current);
        }
        gsap.set(elementsToSet, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline();

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION.DURATION_MEDIUM,
            ease: "power3.out",
          }
        );
      }

      if (displayImageUrl && imageRef.current) {
        if (!imageLoaded && skeletonRef.current) {
          // Animate skeleton if image not loaded yet
          tl.fromTo(
            skeletonRef.current,
            { opacity: 0, scale: 0.95, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: ANIMATION.DURATION_MEDIUM,
              ease: "power3.out",
            },
            "-=0.15"
          );
        } else if (imageLoaded) {
          // Animate actual image if loaded
          tl.fromTo(
            imageRef.current,
            { opacity: 0, scale: 0.95, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: ANIMATION.DURATION_MEDIUM,
              ease: "power3.out",
            },
            "-=0.15"
          );
        }
      }

      return () => {
        tl.kill();
      };
    }
  }, [post, displayImageUrl]);

  // Clean markdown content: remove empty code blocks (but preserve actual code blocks)
  // Memoized to avoid expensive regex operations on every render
  // MUST be called before any early returns to maintain consistent hook order
  const cleanedContent = useMemo(() => {
    if (!post?.content) return "";

    let content = post.content;

    // Protect code blocks first by temporarily replacing them
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];
    content = content.replace(codeBlockRegex, (match) => {
      // Only remove if it's truly empty (just backticks and whitespace)
      if (/^```\s*```$/.test(match.trim())) {
        return "";
      }
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Remove empty inline code (``) - but not inside code blocks
    content = content.replace(/`\s*`/g, "");

    // Normalize excessive newlines outside code blocks
    content = content.replace(/\n{3,}/g, "\n\n");

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      content = content.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return content.trim();
  }, [post?.content]);

  if (isLoading && !post) {
    return <PostContentSkeleton />;
  }

  return (
    <ScrollArea className="h-full bg-background overflow-x-hidden">
      <div
        className="w-full max-w-full min-w-0 box-border"
        style={{ maxWidth: "100%" }}
      >
        <article
          ref={articleRef}
          className="mx-auto w-full max-w-full md:max-w-4xl min-w-0 px-4 md:px-6 py-8 box-border"
          style={{ maxWidth: "100%", width: "100%" }}
        >
          {/* Post header */}
          <header ref={headerRef} className="mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight break-words text-foreground">
              {post?.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(post?.date || 0)}</span>
              <span>•</span>
              <span>{post?.author}</span>
              <span>•</span>
              <Badge variant="secondary">{post?.category}</Badge>
            </div>

            {/* Tags */}
            {post?.tags && post?.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post?.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator className="mb-8" />

          {/* Featured image */}
          {displayImageUrl && (
            <div ref={imageRef} className="mb-8">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-lg bg-muted relative"
              >
                {!imageLoaded && (
                  <div ref={skeletonRef} className="absolute inset-0">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                )}
                <Image
                  src={displayImageUrl}
                  alt={post?.title || ""}
                  fill
                  className="object-cover"
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </AspectRatio>
            </div>
          )}

          {/* Post content - Markdown rendered */}
          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none md:max-w-none break-words w-full"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                code: ({
                  className,
                  children,
                  ...props
                }: React.ComponentPropsWithoutRef<"code">) => {
                  // Check if code is empty (for filtering empty code blocks)
                  const codeString = String(children || "").replace(/\n$/, "");

                  if (!codeString.trim()) {
                    return null;
                  }

                  // Preserve all props and className for syntax highlighting
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({
                  children,
                  ...props
                }: React.ComponentPropsWithoutRef<"pre">) => {
                  if (!children) return null;

                  // Check if children contains a code element
                  const child = Array.isArray(children)
                    ? children[0]
                    : children;

                  // If child is a code element, check its content
                  if (child && typeof child === "object" && "props" in child) {
                    const codeElement = child.props?.children;
                    const codeString =
                      typeof codeElement === "string"
                        ? codeElement
                        : String(codeElement || "").replace(/\n$/, "");

                    if (!codeString.trim()) {
                      return null;
                    }
                  }

                  // Preserve all props and structure for syntax highlighting
                  // Add proper styling for code blocks
                  return (
                    <pre
                      {...props}
                      className="overflow-x-auto rounded-lg bg-muted p-4 my-4"
                    >
                      {children}
                    </pre>
                  );
                },
                p: ({ children }: React.ComponentPropsWithoutRef<"p">) => {
                  if (!children) return null;

                  const childrenArray = Array.isArray(children)
                    ? children
                    : [children];
                  const hasOnlyEmptyCode = childrenArray.every(
                    (child: React.ReactNode) => {
                      if (typeof child === "string") {
                        return !child.trim() || /^`+\s*`+$/.test(child.trim());
                      }
                      if (isValidElement(child)) {
                        const element = child as React.ReactElement<{
                          className?: string;
                          children?: React.ReactNode;
                        }>;
                        if (
                          element.type === "code" ||
                          (typeof element.props.className === "string" &&
                            element.props.className.includes("language-"))
                        ) {
                          const codeContent = String(
                            element.props.children || ""
                          ).trim();
                          return !codeContent;
                        }
                      }
                      return false;
                    }
                  );

                  if (hasOnlyEmptyCode) {
                    return null;
                  }

                  return <p>{children}</p>;
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead>{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="border border-border px-4 py-2 text-left font-semibold bg-muted">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">{children}</td>
                ),
                button: ({
                  children,
                  onClick,
                  ...props
                }: React.ComponentPropsWithoutRef<"button">) => {
                  // Filter out onClick if it's not a function (from raw HTML)
                  // Only pass onClick if it's actually a function
                  const buttonProps: React.ComponentPropsWithoutRef<"button"> =
                    {
                      ...props,
                      ...(typeof onClick === "function" && { onClick }),
                    };
                  return <button {...buttonProps}>{children}</button>;
                },
                img: ({ src, alt }) => {
                  if (!src || typeof src !== "string") return null;
                  // Use regular img for data URLs or if src is not a valid URL
                  const isDataUrl = src.startsWith("data:");
                  const isValidUrl =
                    src.startsWith("http") || src.startsWith("/");

                  if (isDataUrl || !isValidUrl) {
                    return (
                      <div className="my-4">
                        <AspectRatio
                          ratio={16 / 9}
                          className="overflow-hidden rounded-lg"
                        >
                          <img
                            src={src}
                            alt={alt || ""}
                            className="h-full w-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    );
                  }

                  return (
                    <div className="my-4">
                      <AspectRatio
                        ratio={16 / 9}
                        className="overflow-hidden rounded-lg"
                      >
                        <Image
                          src={src}
                          alt={alt || ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                        />
                      </AspectRatio>
                    </div>
                  );
                },
              }}
            >
              {cleanedContent}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </ScrollArea>
  );
}
