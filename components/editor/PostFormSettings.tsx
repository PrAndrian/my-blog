"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Send } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PostFormData } from "./PostForm";
import { ImageUploader } from "./ImageUploader";
import { SlugInput } from "./SlugInput";
import type { Id } from "@/convex/_generated/dataModel";
import { PostFormTags } from "./PostFormTags";
import { CATEGORIES } from "@/types/post";

interface PostFormSettingsProps {
  form: UseFormReturn<PostFormData>;
  postId?: Id<"posts">;
  isSubmitting?: boolean;
  onDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onClose: () => void;
}

function CategorySelectWrapper({
  field,
}: {
  field: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    ref?: React.Ref<any>;
  };
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <CategorySelect
      field={field}
      formItemId={formItemId}
      formDescriptionId={formDescriptionId}
      formMessageId={formMessageId}
      error={error}
    />
  );
}

function CategorySelect({
  field,
  formItemId,
  formDescriptionId,
  formMessageId,
  error,
}: {
  field: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
  };
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error?: { message?: string };
}) {
  const handleValueChange = (value: string) => {
    field.onChange(value);
    field.onBlur?.();
  };

  return (
    <Select onValueChange={handleValueChange} value={field.value}>
      <SelectTrigger
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        name={field.name}
      >
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
CategorySelect.displayName = "CategorySelect";

export function PostFormSettings({
  form,
  postId,
  isSubmitting = false,
  onDraft,
  onPublish,
  onClose,
}: PostFormSettingsProps) {
  const handleDraftClick = async () => {
    await onDraft();
    onClose();
  };

  const handlePublishClick = async () => {
    await onPublish();
    onClose();
  };

  return (
    <div className="mt-6 space-y-6">
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Slug <span className="text-destructive">*</span>
            </FormLabel>
            <SlugInput
              value={field.value}
              onChange={field.onChange}
              title={form.watch("title")}
              excludePostId={postId}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Category <span className="text-destructive">*</span>
            </FormLabel>
            <CategorySelectWrapper field={field} />
            <FormMessage />
          </FormItem>
        )}
      />

      <PostFormTags form={form} />

      <FormField
        control={form.control}
        name="featuredImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Featured Image</FormLabel>
            <FormControl>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                onRemove={() => field.onChange(undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleDraftClick}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={handlePublishClick}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Publish
        </Button>
      </div>
    </div>
  );
}

