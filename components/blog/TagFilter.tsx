"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

interface TagWithCount {
  tag: string;
  count: number;
}

interface TagFilterProps {
  availableTags: TagWithCount[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagToggle,
  onClearAll,
}: TagFilterProps) {
  const t = useTranslations("TagFilter");
  if (availableTags.length === 0) {
    return null;
  }

  const hasSelectedTags = selectedTags.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Filter className="h-4 w-4" />
          {t("filter")}
          {hasSelectedTags && (
            <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableTags.map(({ tag, count }) => (
          <DropdownMenuCheckboxItem
            key={tag}
            checked={selectedTags.includes(tag)}
            onCheckedChange={() => onTagToggle(tag)}
          >
            <span className="flex-1">{tag}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({count})
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        {hasSelectedTags && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClearAll}
              className="text-center justify-center"
            >
              {t("clearAll")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
