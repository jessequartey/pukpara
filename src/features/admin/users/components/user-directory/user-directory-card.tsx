"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  banUser,
  impersonateUser,
  removeUser,
  unbanUser,
} from "@/lib/auth-admin-client";

import { UserTable } from "../user-table";
import type { UserTableRow } from "../user-table/columns";
import type { UserTableSortState } from "../user-table/index";

// Mock data for now - replace with actual API call
const _mockUsers: UserTableRow[] = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-15T10:30:00Z",
    phoneNumber: "+233201234567",
    phoneNumberVerified: true,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "123 Main St, Accra",
    kycStatus: "verified",
    status: "active",
    approvedAt: "2024-01-16T09:00:00Z",
    lastLogin: "2024-01-20T14:30:00Z",
    districtName: "Accra Metropolitan",
    regionName: "Greater Accra",
    organizationCount: 2,
    organizationNames: ["Farmer Org 1", "Cooperative 2"],
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-10T08:15:00Z",
    phoneNumber: "+233207654321",
    phoneNumberVerified: false,
    role: "admin",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "456 Oak Ave, Kumasi",
    kycStatus: "pending",
    status: "active",
    approvedAt: "2024-01-11T10:00:00Z",
    lastLogin: "2024-01-19T16:45:00Z",
    districtName: "Kumasi Metropolitan",
    regionName: "Ashanti",
    organizationCount: 1,
    organizationNames: ["Admin Corp"],
  },
];

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Users Directory</CardTitle>
          <div className="relative w-72">
            <Search className="absolute top-2.5 left-2 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, location, or organization..."
              value={search}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
        />
      </CardContent>
    </Card>
  );
}
