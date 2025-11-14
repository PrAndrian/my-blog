"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Send, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PostFormData } from "./PostForm";
import { ImageUploader } from "./ImageUploader";
import { SlugInput } from "./SlugInput";
import type { Id } from "@/convex/_generated/dataModel";
import { PostFormTags } from "./PostFormTags";
import { CATEGORIES } from "@/types/post";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { showSuccess, showError } from "@/lib/toast";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const generateSEOMetadata = useAction(api.ai.generateSEOMetadata);

  const handleDraftClick = async () => {
    await onDraft();
    onClose();
  };

  const handlePublishClick = async () => {
    await onPublish();
    onClose();
  };

  const handleGenerateMetadata = async () => {
    try {
      setIsGenerating(true);
      const title = form.watch("title");
      const content = form.watch("content");
      const slug = form.watch("slug");

      if (!content || !slug) {
        showError("Please add content and slug before generating metadata");
        return;
      }

      const metadata = await generateSEOMetadata({
        slug,
        title: title || undefined,
        content,
        pageType: "blog",
      });

      // Update form with generated metadata
      form.setValue("seo_title", metadata.title);
      form.setValue("meta_description", metadata.meta_description);

      showSuccess(
        `Metadata generated with ${metadata.keywords.length} keywords`
      );
    } catch (error) {
      console.error("Error generating metadata:", error);
      showError("Could not generate metadata. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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

      {/* SEO Metadata Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">SEO Metadata</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateMetadata}
            disabled={isGenerating || isSubmitting}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Override default title for search engines"
                />
              </FormControl>
              <FormDescription>
                Leave empty to use the main title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Narrative, evocative description for search engines and social media (150-180 chars)"
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 180 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="og_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenGraph Image URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Custom image for social media previews"
                />
              </FormControl>
              <FormDescription>
                Leave empty to use the featured image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
