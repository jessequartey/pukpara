"use client";

import { useEffect, useState } from "react";

import { listUsers } from "@/lib/auth-admin-client";

import type { UserTableRow } from "../components/user-table/columns";
import type { UserTableSortState } from "../components/user-table/index";

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

export function useUserListController() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserTableSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<UserTableRow[]>([]);
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

        setUsers(transformedUsers);
      } catch {
        setUsers([]);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  return {
    users,
    search,
    setSearch,
    sort,
    setSort,
    selectedIds,
    setSelectedIds,
    isLoading,
    isFetching,
  };
}
