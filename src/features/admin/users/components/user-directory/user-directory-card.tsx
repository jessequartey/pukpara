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
import {
  banUser,
  impersonateUser,
  removeUser,
  unbanUser,
} from "@/lib/auth-admin-client";

import { UserTable } from "../user-table";
import type { UserColumnKey, UserTableRow } from "../user-table/columns";
import { userColumns } from "../user-table/columns";
import type { UserTableSortState } from "../user-table/index";


type UserDirectoryController = {
  users: UserTableRow[];
  search: string;
  setSearch: (search: string) => void;
  sort: UserTableSortState;
  setSort: (sort: UserTableSortState) => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  isLoading: boolean;
  isFetching: boolean;
};

type UserDirectoryCardProps = {
  controller: UserDirectoryController;
};

export function UserDirectoryCard({ controller }: UserDirectoryCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const allColumnKeys = useMemo(
    () => userColumns.map((column) => column.key as UserColumnKey),
    []
  );

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    Set<UserColumnKey>
  >(() => new Set(allColumnKeys));

  useEffect(() => {
    if (visibleColumnKeys.size === 0 && allColumnKeys.length > 0) {
      setVisibleColumnKeys(new Set(allColumnKeys));
    }
  }, [allColumnKeys, visibleColumnKeys]);

  const {
    users,
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

  const toggleColumn = (key: UserColumnKey) => {
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

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!search) {
      return true;
    }

    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower) ||
      user.districtName?.toLowerCase().includes(searchLower) ||
      user.regionName?.toLowerCase().includes(searchLower) ||
      user.organizationNames.some((org) =>
        org.toLowerCase().includes(searchLower)
      )
    );
  });

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
      setSelectedIds(new Set(filteredUsers.map((user) => user.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleApprove = (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement user approval API call
      toast.success(`${row.name} has been approved successfully.`);
    } catch {
      toast.error("Failed to approve user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement user rejection API call
      toast.success(`${row.name} has been rejected.`);
    } catch {
      toast.error("Failed to reject user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuspend = (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement user suspension API call
      toast.success(`${row.name} has been suspended.`);
    } catch {
      toast.error("Failed to suspend user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBan = async (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      await banUser({
        userId: row.id,
        banReason: "Administrative action",
        // banExpiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });
      toast.success(`${row.name} has been banned from the platform.`);
    } catch {
      toast.error("Failed to ban user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnban = async (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      await unbanUser({ userId: row.id });
      toast.success(
        `${row.name} has been unbanned and can access the platform again.`
      );
    } catch {
      toast.error("Failed to unban user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      await removeUser({ userId: row.id });
      toast.success(`${row.name} has been permanently deleted.`);
    } catch {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleView = (row: UserTableRow) => {
    // Navigate to user details page
    window.open(`/admin/users/${row.id}`, "_blank");
  };

  const handleImpersonate = async (row: UserTableRow) => {
    try {
      setIsActionLoading(true);
      await impersonateUser({ userId: row.id });
      toast.success(
        `You are now impersonating ${row.name}. Click "Stop Impersonating" to return to your admin account.`
      );
      // Refresh the page to show the impersonated session
      window.location.reload();
    } catch {
      toast.error("Failed to impersonate user. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-4 border-b pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            aria-label="Search users"
            className="w-full sm:max-w-lg"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, location, or organization..."
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
              {userColumns.map((column) => {
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
        <UserTable
          data={filteredUsers}
          isFetching={isFetching}
          isLoading={isLoading || isActionLoading}
          onApprove={handleApprove}
          onBan={handleBan}
          onDelete={handleDelete}
          onImpersonate={handleImpersonate}
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
