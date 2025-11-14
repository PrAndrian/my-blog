"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { FileEdit, Home, PlusCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  group: "author" | "admin";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isAdmin = useQuery(api.users.isAdmin);
  const canPerformAuthorActions = useQuery(api.users.canPerformAuthorActions);

  useEffect(() => {
    if (!canPerformAuthorActions && open) {
      setOpen(false);
    }
  }, [canPerformAuthorActions, open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canPerformAuthorActions) {
          setOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [canPerformAuthorActions]);

  const authorCommands: Command[] = [
    {
      id: "blog",
      label: "Blog Interface",
      icon: <Home className="h-4 w-4" />,
      href: "/",
      group: "author",
    },
    {
      id: "create-post",
      label: "Create Post",
      icon: <PlusCircle className="h-4 w-4" />,
      href: "/create-post",
      group: "author",
    },
    {
      id: "my-posts",
      label: "My Posts",
      icon: <FileEdit className="h-4 w-4" />,
      href: "/my-posts",
      group: "author",
    },
  ];

  const adminCommands: Command[] = [
    {
      id: "admin-dashboard",
      label: "Admin Dashboard",
      icon: <Shield className="h-4 w-4" />,
      href: "/admin",
      group: "admin",
    },
  ];

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={canPerformAuthorActions ? setOpen : () => {}}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {canPerformAuthorActions && (
          <>
            <CommandGroup heading="Author">
              {authorCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command.href)}
                >
                  {command.icon}
                  <span>{command.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {isAdmin && <CommandSeparator />}
          </>
        )}
        {isAdmin && (
          <CommandGroup heading="Admin">
            {adminCommands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => handleSelect(command.href)}
              >
                {command.icon}
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
