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
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("Navigation");
  const tAdmin = useTranslations("Admin");
  const tSearch = useTranslations("Search");
  const locale = useLocale();

  // Close dialog when user loses author permissions
  useEffect(() => {
    if (!canPerformAuthorActions) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [canPerformAuthorActions]);

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
      label: t("home"),
      icon: <Home className="h-4 w-4" />,
      href: `/${locale}`,
      group: "author",
    },
    {
      id: "create-post",
      label: t("createPost"),
      icon: <PlusCircle className="h-4 w-4" />,
      href: `/${locale}/create-post`,
      group: "author",
    },
    {
      id: "my-posts",
      label: t("myPosts"),
      icon: <FileEdit className="h-4 w-4" />,
      href: `/${locale}/my-posts`,
      group: "author",
    },
  ];

  const adminCommands: Command[] = [
    {
      id: "admin-dashboard",
      label: tAdmin("title"),
      icon: <Shield className="h-4 w-4" />,
      href: `/${locale}/admin`,
      group: "admin",
    },
  ];

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={canPerformAuthorActions ? setOpen : () => {}}
    >
      <CommandInput placeholder={t("search")} />
      <CommandList>
        <CommandEmpty>{tSearch("noResults")}</CommandEmpty>
        {canPerformAuthorActions && (
          <>
            <CommandGroup heading="Author">
              {authorCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command.href)}
                >
                  {command.icon}
                  <span className="ml-2">{command.label}</span>
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
                <span className="ml-2">{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
