import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { PostFormData } from "@/components/editor/PostForm";
import { EDITOR_CONFIG } from "@/lib/editorConstants";

const MAX_TAG_LENGTH = EDITOR_CONFIG.MAX_TAG_LENGTH;
const MAX_TAGS = EDITOR_CONFIG.MAX_TAGS;

export function usePostFormTags(form: UseFormReturn<PostFormData>) {
  const [tagInput, setTagInput] = useState("");

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    const currentTags = form.getValues("tags");

    if (!tag) return;

    if (currentTags.includes(tag)) {
      return; // Tag already exists
    }

    if (tag.length > MAX_TAG_LENGTH) {
      form.setError("tags", {
        type: "manual",
        message: `Tag must be ${MAX_TAG_LENGTH} characters or less`,
      });
      return;
    }

    if (currentTags.length >= MAX_TAGS) {
      form.setError("tags", {
        type: "manual",
        message: `Maximum ${MAX_TAGS} tags allowed`,
      });
      return;
    }

    if (!/^[a-z0-9\s-]+$/.test(tag)) {
      form.setError("tags", {
        type: "manual",
        message: "Tag can only contain letters, numbers, spaces, and hyphens",
      });
      return;
    }

    form.setValue("tags", [...currentTags, tag]);
    setTagInput("");
    form.clearErrors("tags");
  }, [tagInput, form]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = form.getValues("tags");
      form.setValue(
        "tags",
        currentTags.filter((tag) => tag !== tagToRemove)
      );
    },
    [form]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag();
      }
    },
    [addTag]
  );

  return {
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
  };
}
