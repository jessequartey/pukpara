"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OrganizationSectionNavProps = {
  items: {
    label: string;
    href: string;
    isActive: boolean;
  }[];
};

export function OrganizationSectionNav({ items }: OrganizationSectionNavProps) {
  const router = useRouter();
  const activeItem = items.find((item) => item.isActive) ?? items.at(0);

  const handleSelect = (value: string) => {
    router.push(value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full justify-between"
              size="sm"
              variant="outline"
            >
              <span>{activeItem?.label ?? "Select section"}</span>
              <ChevronDown aria-hidden className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuRadioGroup
              onValueChange={handleSelect}
              value={activeItem?.href}
            >
              {items.map((item) => (
                <DropdownMenuRadioItem key={item.href} value={item.href}>
                  {item.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav aria-label="Organization sections" className="hidden sm:block">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              aria-current={item.isActive ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 font-medium text-sm transition-colors",
                item.isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
