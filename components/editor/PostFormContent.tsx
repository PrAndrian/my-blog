"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { PostFormData } from "./PostForm";
import { TiptapEditor } from "./TiptapEditor";

interface PostFormContentProps {
  form: UseFormReturn<PostFormData>;
}

export function PostFormContent({ form }: PostFormContentProps) {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TiptapEditor value={field.value} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

