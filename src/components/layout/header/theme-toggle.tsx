"use client";

import { Monitor, MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themeOptions = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: MoonStar },
  { id: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme ?? "system";

  const ActiveIcon =
    themeOptions.find((option) => option.id === activeTheme)?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle theme"
          className="relative"
          size="icon"
          type="button"
          variant="outline"
        >
          <ActiveIcon aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            className={cn(
              "flex items-center gap-2",
              option.id === activeTheme && "text-primary"
            )}
            key={option.id}
            onSelect={(event) => {
              event.preventDefault();
              if (!mounted) {
                return;
              }
              setTheme(option.id);
            }}
          >
            <option.icon aria-hidden="true" className="h-4 w-4" />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
