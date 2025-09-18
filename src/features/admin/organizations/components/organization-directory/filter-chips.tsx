"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterChip = {
  key: string;
  label: string;
};

type FilterChipsProps = {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onReset: () => void;
};

export function FilterChips({ chips, onRemove, onReset }: FilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary">
          <span className="mr-2 text-muted-foreground text-xs uppercase">
            {chip.label}
          </span>
          <button
            aria-label={`Remove ${chip.label}`}
            className="rounded-full bg-background/60 px-1 font-semibold text-[10px]"
            onClick={() => onRemove(chip.key)}
            type="button"
          >
            ✕
          </button>
        </Badge>
      ))}
      <Button onClick={onReset} size="sm" type="button" variant="ghost">
        Clear all
      </Button>
    </div>
  );
}
