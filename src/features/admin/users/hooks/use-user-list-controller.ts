"use client";

import { useEffect, useMemo, useState } from "react";

import { listUsers } from "@/lib/auth-admin-client";

import type { UserTableRow } from "../components/user-table/columns";
import type { UserTableSortState } from "../components/user-table/index";

const ROW_OPTION_SMALL = 10;
const ROW_OPTION_MEDIUM = 20;
const ROW_OPTION_LARGE = 50;

export const ROW_OPTIONS = [
  ROW_OPTION_SMALL,
  ROW_OPTION_MEDIUM,
  ROW_OPTION_LARGE,
] as const;

const transformUserBaseFields = (u: Record<string, unknown>) => ({
  id: String(u.id ?? ""),
  name: String(u.name ?? ""),
  email: String(u.email ?? ""),
  emailVerified: Boolean(u.emailVerified),
  image: u.image ? String(u.image) : null,
  createdAt: u.createdAt ? (u.createdAt as Date | string) : null,
  phoneNumber: u.phoneNumber ? String(u.phoneNumber) : null,
  phoneNumberVerified: u.phoneNumberVerified
    ? Boolean(u.phoneNumberVerified)
    : null,
  role: u.role ? String(u.role) : null,
  banned: Boolean(u.banned),
});

const transformUserExtendedFields = (u: Record<string, unknown>) => ({
  banReason: u.banReason ? String(u.banReason) : null,
  banExpires: u.banExpires ? (u.banExpires as Date | string) : null,
  address: String(u.address ?? ""),
  kycStatus: u.kycStatus ? String(u.kycStatus) : null,
  status: u.status ? String(u.status) : null,
  approvedAt: u.approvedAt ? (u.approvedAt as Date | string) : null,
  lastLogin: u.lastLogin ? (u.lastLogin as Date | string) : null,
  districtName: u.districtName ? String(u.districtName) : null,
  regionName: u.regionName ? String(u.regionName) : null,
  organizationCount: Number(u.organizationCount ?? 0),
  organizationNames: Array.isArray(u.organizationNames)
    ? u.organizationNames.map(String)
    : [],
});

const transformUser = (user: unknown): UserTableRow => {
  const u = user as Record<string, unknown>;
  return {
    ...transformUserBaseFields(u),
    ...transformUserExtendedFields(u),
  } as UserTableRow;
};

// Helper function to get sort value for a field
const getSortValue = (
  row: UserTableRow,
  field: string
): string | number => {
  switch (field) {
    case "name":
      return row.name.toLowerCase();
    case "email":
      return row.email.toLowerCase();
    case "createdAt":
      return row.createdAt ? new Date(row.createdAt).getTime() : 0;
    case "lastLogin":
      return row.lastLogin ? new Date(row.lastLogin).getTime() : 0;
    case "role":
      return row.role ?? "";
    case "status":
      return row.status ?? "";
    case "districtName":
      return row.districtName?.toLowerCase() ?? "";
    case "regionName":
      return row.regionName?.toLowerCase() ?? "";
    case "organizationCount":
      return row.organizationCount;
    default:
      return "";
  }
};

// Client-side sorting function
const sortUsers = (
  users: UserTableRow[],
  sort: UserTableSortState
): UserTableRow[] => {
  return [...users].sort((a, b) => {
    const aValue = getSortValue(a, sort.field);
    const bValue = getSortValue(b, sort.field);

    if (aValue < bValue) {
      return sort.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

// Client-side search filter function
const filterUsers = (
  users: UserTableRow[],
  searchTerm: string
): UserTableRow[] => {
  if (!searchTerm.trim()) {
    return users;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  return users.filter((user) => {
    return (
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.phoneNumber?.toLowerCase().includes(normalizedSearch) ||
      user.districtName?.toLowerCase().includes(normalizedSearch) ||
      user.regionName?.toLowerCase().includes(normalizedSearch) ||
      user.organizationNames.some((org) =>
        org.toLowerCase().includes(normalizedSearch)
      )
    );
  });
};

export function useUserListController() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof ROW_OPTIONS)[number]>(ROW_OPTION_MEDIUM);
  const [sort, setSort] = useState<UserTableSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<UserTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsFetching(true);
        const { data: usersData, error } = await listUsers({
          query: {
            limit: 1000,
          },
        });

        if (error) {
          throw error;
        }

        // Transform the API response to match our UserTableRow interface
        const usersList = usersData?.users || [];
        const transformedUsers: UserTableRow[] = usersList.map(transformUser);

        setAllUsers(transformedUsers);
      } catch {
        setAllUsers([]);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply client-side filtering, sorting, and pagination
  const filteredData = useMemo(
    () => filterUsers(allUsers, search),
    [allUsers, search]
  );
  const sortedData = useMemo(
    () => sortUsers(filteredData, sort),
    [filteredData, sort]
  );
  const total = sortedData.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  // Client-side pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = sortedData.slice(startIndex, endIndex);

  const handleSortChange = (nextSort: UserTableSortState) => {
    setSort(nextSort);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const rows = checked ? data : [];
    setSelectedIds(new Set(rows.map((row) => row.id)));
  };

  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
    setSelectedIds(new Set()); // Clear selection when searching
  };

  return {
    search,
    setSearch: updateSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort: handleSortChange,
    selectedIds,
    setSelectedIds,
    data,
    total,
    totalPages,
    startRow,
    endRow,
    handleSelectRow,
    handleSelectAll,
    isLoading,
    isFetching,
  };
}
