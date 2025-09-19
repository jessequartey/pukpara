"use client";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        disabled={page <= 1 || isLoading}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Button
        disabled={page >= totalPages || isLoading}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}
