"use client";

import { EDITOR_CONFIG } from "@/lib/editorConstants";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MarkdownIt from "markdown-it";
import { markdownItTable } from "markdown-it-table";
import { useEffect, useMemo, useRef, useState } from "react";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SlashCommands } from "./extensions/SlashCommands";
import { YouTubeNode } from "./extensions/YouTubeNode";
import { VideoNode } from "./extensions/VideoNode";
import {
  validateFile,
  uploadFileToConvex,
  getFileTypeCategory,
} from "@/lib/fileUpload";
import { parseYouTubeVideoInfo } from "@/lib/videoEmbeds";
import { showSuccess, showError } from "@/lib/toast";
import { toast } from "sonner";
import { VideoEmbedDialog } from "./VideoEmbedDialog";
import "tippy.js/dist/tippy.css";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const createMarkdownServices = () => {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  turndownService.use(gfm);

  // Add custom rule for YouTube embeds
  turndownService.addRule("youtube", {
    filter: (node) => {
      return (
        node.nodeName === "DIV" && node.getAttribute("data-type") === "youtube"
      );
    },
    replacement: (_content, node) => {
      const videoId = (node as Element).getAttribute("data-video-id");
      return videoId ? `\n\n[youtube:${videoId}]\n\n` : "";
    },
  });

  // Add custom rule for uploaded video embeds
  turndownService.addRule("video", {
    filter: (node) => {
      return (
        node.nodeName === "DIV" && node.getAttribute("data-type") === "video"
      );
    },
    replacement: (_content, node) => {
      const storageId = (node as Element).getAttribute("data-storage-id");
      return storageId ? `\n\n[video:${storageId}]\n\n` : "";
    },
  });

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItTable);

  // Add custom rule to parse YouTube placeholders into nodes
  // Process at block level to create proper block-level HTML
  md.core.ruler.before("inline", "youtube", (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "inline") continue;
      if (!tokens[i].content) continue;

      const content = tokens[i].content;
      const match = content.match(/\[youtube:([^\]]+)\]/i);

      if (!match) continue;

      const videoId = match[1].trim();

      // Replace paragraph tokens with HTML block
      if (i > 0 && tokens[i - 1].type === "paragraph_open") {
        // Create HTML block token with comment to prevent Turndown from skipping
        const htmlBlock = new state.Token("html_block", "", 0);
        htmlBlock.content = `<div data-type="youtube" data-video-id="${videoId}"><!-- youtube-embed --></div>\n`;

        // Replace paragraph_open, inline, paragraph_close with html_block
        tokens.splice(i - 1, 3, htmlBlock);
        i--; // Adjust index after splice
      }
    }
  });

  // Add custom rule to parse uploaded video placeholders into nodes
  md.core.ruler.before("inline", "video", (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "inline") continue;
      if (!tokens[i].content) continue;

      const content = tokens[i].content;
      const match = content.match(/\[video:([^\]]+)\]/i);

      if (!match) continue;

      const storageId = match[1].trim();

      // Replace paragraph tokens with HTML block
      if (i > 0 && tokens[i - 1].type === "paragraph_open") {
        // Create HTML block token with comment to prevent Turndown from skipping
        const htmlBlock = new state.Token("html_block", "", 0);
        htmlBlock.content = `<div data-type="video" data-storage-id="${storageId}"><!-- video-embed --></div>\n`;

        // Replace paragraph_open, inline, paragraph_close with html_block
        tokens.splice(i - 1, 3, htmlBlock);
        i--; // Adjust index after splice
      }
    }
  });

  return { turndownService, md };
};

export function TiptapEditor({
  value,
  onChange,
  placeholder = EDITOR_CONFIG.PLACEHOLDER,
}: TiptapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef<string>(value || "");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const convex = useConvex();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const { turndownService, md } = useMemo(() => createMarkdownServices(), []);

  // Handle image upload from slash command
  const handleImageUpload = async (file: File) => {
    const validation = validateFile(file, "image");
    if (!validation.valid) {
      showError(validation.error || "Invalid file");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const uploadUrl = await generateUploadUrl({
        fileSize: file.size,
        fileType: file.type,
      });

      const storageId = await uploadFileToConvex(
        file,
        uploadUrl,
        (progress) => {
          toast.loading(`Uploading ${file.name}... ${progress}%`, {
            id: toastId,
          });
        }
      );

      // Get public URL from storage ID using convex client
      const fileUrl = await convex.query(api.files.getFileUrl, { storageId });

      if (fileUrl && editor) {
        editor.chain().focus().setImage({ src: fileUrl }).run();
        toast.success("Image uploaded successfully", { id: toastId });
      } else {
        throw new Error("Failed to get file URL");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    }
  };

  // Handle video upload from slash command
  const handleVideoUpload = async (file: File) => {
    const validation = validateFile(file, "video");
    if (!validation.valid) {
      showError(validation.error || "Invalid file");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const uploadUrl = await generateUploadUrl({
        fileSize: file.size,
        fileType: file.type,
      });

      const storageId = await uploadFileToConvex(
        file,
        uploadUrl,
        (progress) => {
          toast.loading(`Uploading ${file.name}... ${progress}%`, {
            id: toastId,
          });
        }
      );

      if (storageId && editor) {
        // Insert VideoNode (will show Notion-style preview in editor)
        editor.chain().focus().setVideo({ storageId }).run();
        toast.success("Video uploaded successfully", { id: toastId });
      } else {
        throw new Error("Failed to upload video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video. Please try again.", { id: toastId });
    }
  };

  // Handle YouTube embed from slash command
  const handleYoutubeEmbed = () => {
    setYoutubeDialogOpen(true);
  };

  // Handle YouTube video URL submission from dialog
  const handleYoutubeVideoSubmit = (url: string) => {
    if (!editor) return;

    const videoInfo = parseYouTubeVideoInfo(url);
    if (!videoInfo) {
      showError("Invalid YouTube URL. Please try again.");
      return;
    }

    // Insert YouTube node (will show Notion-style preview in editor)
    editor
      .chain()
      .focus()
      .setYouTubeVideo({ videoId: videoInfo.videoId })
      .run();

    showSuccess("YouTube video embedded successfully");
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-muted rounded-lg p-4",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-border",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      YouTubeNode,
      VideoNode,
      SlashCommands.configure({
        onImageUpload: () => {
          imageInputRef.current?.click();
        },
        onVideoUpload: () => {
          videoInputRef.current?.click();
        },
        onYoutubeEmbed: handleYoutubeEmbed,
      }),
    ],
    content: value ? md.render(value) : "",
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-slate dark:prose-invert max-w-none focus:outline-none",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files.length > 0
        ) {
          event.preventDefault();

          const file = event.dataTransfer.files[0];
          const fileType = getFileTypeCategory(file);

          if (fileType === "image") {
            handleImageUpload(file);
            return true;
          } else if (fileType === "video") {
            handleVideoUpload(file);
            return true;
          }
        }

        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
              return true;
            }
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;

      try {
        const html = editor.getHTML();
        const markdown = turndownService.turndown(html);

        if (markdown !== lastValueRef.current) {
          lastValueRef.current = markdown;
          onChange(markdown);
        }
      } catch (error) {
        console.error("Error converting HTML to markdown:", error);
      }
    },
  });

  // Hydration-safe mounting pattern
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  useEffect(() => {
    if (!mounted || !editor || isUpdatingRef.current) return;

    if (value !== lastValueRef.current && value !== undefined) {
      isUpdatingRef.current = true;
      lastValueRef.current = value;

      try {
        const html = md.render(value || "");
        editor.commands.setContent(html, { emitUpdate: false });
        requestAnimationFrame(() => {
          isUpdatingRef.current = false;
        });
      } catch (error) {
        console.error("Error converting markdown to HTML:", error);
        isUpdatingRef.current = false;
      }
    }
  }, [value, mounted, editor, md]);

  if (!mounted) {
    return (
      <div className="h-screen bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <EditorContent editor={editor} />

      {/* Hidden file inputs for slash commands */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
          // Reset input so same file can be selected again
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleVideoUpload(file);
          }
          // Reset input so same file can be selected again
          e.target.value = "";
        }}
      />

      {/* YouTube embed dialog */}
      <VideoEmbedDialog
        open={youtubeDialogOpen}
        onClose={() => setYoutubeDialogOpen(false)}
        onSubmit={handleYoutubeVideoSubmit}
      />
    </div>
  );
}
