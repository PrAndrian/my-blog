"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

export interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: any) => void;
}

export interface SlashCommandMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuRef,
  SlashCommandMenuProps
>(({ items, command }, ref) => {
  // Generate a key based on items to reset selection when items change
  const itemsKey = useMemo(() => items.map((i) => i.title).join(","), [items]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastItemsKey, setLastItemsKey] = useState(itemsKey);

  // Reset selection index when items change (derived state pattern)
  if (itemsKey !== lastItemsKey) {
    setLastItemsKey(itemsKey);
    if (selectedIndex !== 0) {
      setSelectedIndex(0);
    }
  }

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (prevIndex) => (prevIndex + items.length - 1) % items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No results
          </div>
        ) : (
          items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={index}
                type="button"
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});

SlashCommandMenu.displayName = "SlashCommandMenu";
