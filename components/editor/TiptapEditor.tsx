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

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItTable);

  return { turndownService, md };
};

export function TiptapEditor({
  value,
  onChange,
  placeholder = EDITOR_CONFIG.PLACEHOLDER,
}: TiptapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef<string>(value || "");

  const { turndownService, md } = useMemo(() => createMarkdownServices(), []);

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
    ],
    content: value ? md.render(value) : "",
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-slate dark:prose-invert max-w-none focus:outline-none",
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
    </div>
  );
}
