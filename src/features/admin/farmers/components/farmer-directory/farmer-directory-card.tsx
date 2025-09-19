"use client";

import { useState, useMemo, useEffect } from "react";
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

import { FarmerTable } from "../farmer-table";
import type { FarmerTableRow, FarmerColumnKey } from "../farmer-table/columns";
import { farmerColumns } from "../farmer-table/columns";
import type { FarmerTableSortState } from "../farmer-table/index";

// Mock data for now - replace with actual API call
const _mockFarmers: FarmerTableRow[] = [
  {
    id: "farmer_1",
    name: "Kwame Asante",
    email: "kwame@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-15T10:30:00Z",
    phoneNumber: "+233201234567",
    phoneNumberVerified: true,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "123 Farm Road, Kumasi",
    status: "approved",
    approvedAt: "2024-01-16T09:00:00Z",
    districtName: "Kumasi Metropolitan",
    regionName: "Ashanti",
    organizationCount: 1,
    organizationNames: ["Ashanti Farmers Cooperative"],
    farmSize: 5.5,
    farmLocation: "Kumasi Outskirts",
    cropTypes: ["Cocoa", "Plantain", "Cassava"],
    certifications: ["Organic Certified"],
  },
  {
    id: "farmer_2",
    name: "Akosua Osei",
    email: "akosua@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-10T08:15:00Z",
    phoneNumber: "+233207654321",
    phoneNumberVerified: false,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "456 Village Road, Tamale",
    status: "pending",
    approvedAt: null,
    districtName: "Tamale Metropolitan",
    regionName: "Northern",
    organizationCount: 2,
    organizationNames: ["Northern Farmers Union", "Women in Agriculture"],
    farmSize: 12.0,
    farmLocation: "Tamale District",
    cropTypes: ["Maize", "Millet", "Sorghum"],
    certifications: [],
  },
  {
    id: "farmer_3",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    emailVerified: false,
    image: null,
    createdAt: "2024-01-20T14:45:00Z",
    phoneNumber: "+233245678901",
    phoneNumberVerified: true,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "789 Coastal Road, Cape Coast",
    status: "approved",
    approvedAt: "2024-01-21T11:00:00Z",
    districtName: "Cape Coast Metropolitan",
    regionName: "Central",
    organizationCount: 1,
    organizationNames: ["Coastal Fishermen & Farmers"],
    farmSize: 3.2,
    farmLocation: "Cape Coast Suburbs",
    cropTypes: ["Coconut", "Cassava"],
    certifications: ["Fair Trade"],
  },
];

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

  const allColumnKeys = useMemo(
    () => farmerColumns.map((column) => column.key as FarmerColumnKey),
    []
  );

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<FarmerColumnKey>>(
    () => new Set(allColumnKeys)
  );

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

  // Filter farmers based on search
  const filteredFarmers = farmers.filter((farmer) => {
    if (!search) {
      return true;
    }

    const searchLower = search.toLowerCase();
    return (
      farmer.name.toLowerCase().includes(searchLower) ||
      farmer.email.toLowerCase().includes(searchLower) ||
      farmer.phoneNumber?.toLowerCase().includes(searchLower) ||
      farmer.districtName?.toLowerCase().includes(searchLower) ||
      farmer.regionName?.toLowerCase().includes(searchLower) ||
      farmer.organizationNames.some((org) =>
        org.toLowerCase().includes(searchLower)
      ) ||
      farmer.cropTypes.some((crop) =>
        crop.toLowerCase().includes(searchLower)
      ) ||
      farmer.farmLocation?.toLowerCase().includes(searchLower)
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
      setSelectedIds(new Set(filteredFarmers.map((farmer) => farmer.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleApprove = (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement farmer approval API call
      toast.success(`${row.name} has been approved successfully.`);
    } catch {
      toast.error("Failed to approve farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement farmer rejection API call
      toast.success(`${row.name} has been rejected.`);
    } catch {
      toast.error("Failed to reject farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuspend = (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      // TODO: Implement farmer suspension API call
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
      await banUser({
        userId: row.id,
        banReason: "Administrative action",
        // banExpiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });
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
      await unbanUser({ userId: row.id });
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
      await removeUser({ userId: row.id });
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

  const handleImpersonate = async (row: FarmerTableRow) => {
    try {
      setIsActionLoading(true);
      await impersonateUser({ userId: row.id });
      toast.success(
        `You are now impersonating ${row.name}. Click "Stop Impersonating" to return to your admin account.`
      );
      // Refresh the page to show the impersonated session
      window.location.reload();
    } catch {
      toast.error("Failed to impersonate farmer. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
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
          data={filteredFarmers}
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