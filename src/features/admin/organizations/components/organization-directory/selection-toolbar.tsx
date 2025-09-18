"use client";

import { Button } from "@/components/ui/button";

type SelectionToolbarProps = {
  count: number;
  isBusy: boolean;
  onApprove: () => void;
  onDelete: () => void;
};

export function SelectionToolbar({
  count,
  isBusy,
  onApprove,
  onDelete,
}: SelectionToolbarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-foreground text-sm">
        {count} organization{count === 1 ? "" : "s"} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          disabled={isBusy}
          onClick={onApprove}
          size="sm"
          type="button"
          variant="default"
        >
          Approve
        </Button>
        <Button
          disabled={isBusy}
          onClick={onDelete}
          size="sm"
          type="button"
          variant="destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
