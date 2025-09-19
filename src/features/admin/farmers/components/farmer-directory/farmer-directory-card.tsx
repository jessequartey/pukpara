"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import { FarmerTable } from "../farmer-table";
import type { FarmerColumnKey, FarmerTableRow } from "../farmer-table/columns";
import { farmerColumns } from "../farmer-table/columns";
import type { FarmerTableSortState } from "../farmer-table/index";

type FarmerDirectoryController = {
  farmers: FarmerTableRow[];
  search: string;
  setSearch: (search: string) => void;
  sort: FarmerTableSortState;
  setSort: (sort: FarmerTableSortState) => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  isLoading: boolean;
  isFetching: boolean;
};

type FarmerDirectoryCardProps = {
  controller: FarmerDirectoryController;
};

export function FarmerDirectoryCard({ controller }: FarmerDirectoryCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const utils = api.useUtils();
  const approveMutation = api.admin.farmers.approve.useMutation();
  const rejectMutation = api.admin.farmers.reject.useMutation();
  const suspendMutation = api.admin.farmers.suspend.useMutation();
  const banMutation = api.admin.farmers.ban.useMutation();
  const unbanMutation = api.admin.farmers.unban.useMutation();
  const deleteMutation = api.admin.farmers.delete.useMutation();

  const allColumnKeys = useMemo(
    () => farmerColumns.map((column) => column.key as FarmerColumnKey),
    []
  );

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    Set<FarmerColumnKey>
  >(() => new Set(allColumnKeys));

  useEffect(() => {
    if (visibleColumnKeys.size === 0 && allColumnKeys.length > 0) {
      setVisibleColumnKeys(new Set(allColumnKeys));
    }
  }, [allColumnKeys, visibleColumnKeys]);

  const {
    farmers,
    search,
    setSearch,
    sort,
    setSort,
    selectedIds,
    setSelectedIds,
    isLoading,
    isFetching,
  } = controller;

  const visibleCount = visibleColumnKeys.size;

  const toggleColumn = (key: FarmerColumnKey) => {
    setVisibleColumnKeys((previous) => {
      if (previous.has(key)) {
        if (previous.size === 1) {
          return previous;
        }
        const next = new Set(previous);
        next.delete(key);
        return next;
      }
      const next = new Set(previous);
      next.add(key);
      return next;
    });
  };

  // The filtering is now handled in the controller hook

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(farmers.map((farmer) => farmer.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleApprove = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await approveMutation.mutateAsync({ userIds: [row.id] });
      await utils.admin.farmers.all.invalidate();
      toast.success(`${row.name} has been approved successfully.`);
    } catch {
      toast.error("Failed to approve farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await rejectMutation.mutateAsync({ userIds: [row.id] });
      await utils.admin.farmers.all.invalidate();
      toast.success(`${row.name} has been rejected.`);
    } catch {
      toast.error("Failed to reject farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuspend = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await suspendMutation.mutateAsync({ userIds: [row.id] });
      await utils.admin.farmers.all.invalidate();
      toast.success(`${row.name} has been suspended.`);
    } catch {
      toast.error("Failed to suspend farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBan = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await banMutation.mutateAsync({
        userIds: [row.id],
        reason: "Administrative action",
      });
      await utils.admin.farmers.all.invalidate();
      toast.success(`${row.name} has been banned from the platform.`);
    } catch {
      toast.error("Failed to ban farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnban = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await unbanMutation.mutateAsync({ userIds: [row.id] });
      await utils.admin.farmers.all.invalidate();
      toast.success(
        `${row.name} has been unbanned and can access the platform again.`
      );
    } catch {
      toast.error("Failed to unban farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await deleteMutation.mutateAsync({ userIds: [row.id] });
      await utils.admin.farmers.all.invalidate();
      toast.success(`${row.name} has been permanently deleted.`);
    } catch {
      toast.error("Failed to delete farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleView = (row: FarmerTableRow) => {
    // Navigate to farmer details page
    window.open(`/admin/farmers/${row.id}`, "_blank");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-4 border-b pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            aria-label="Search farmers"
            className="w-full sm:max-w-lg"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, location, organization, or crops..."
            type="search"
            value={search}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[14rem]">
              {farmerColumns.map((column) => {
                const isChecked = visibleColumnKeys.has(column.key);
                const disableToggle = isChecked && visibleCount === 1;
                return (
                  <DropdownMenuCheckboxItem
                    checked={isChecked}
                    disabled={disableToggle}
                    key={column.key}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <FarmerTable
          data={farmers}
          isFetching={isFetching}
          isLoading={isLoading || isActionLoading}
          onApprove={handleApprove}
          onBan={handleBan}
          onDelete={handleDelete}
          onReject={handleReject}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onSortChange={setSort}
          onSuspend={handleSuspend}
          onUnban={handleUnban}
          onView={handleView}
          selectedIds={selectedIds}
          sort={sort}
          visibleColumnKeys={visibleColumnKeys}
        />
      </CardContent>
    </Card>
  );
}
