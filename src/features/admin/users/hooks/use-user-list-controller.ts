"use client";

import { useState } from "react";

import type { UserTableRow } from "../components/user-table/columns";
import type { UserTableSortState } from "../components/user-table/index";

// Mock data - replace with actual API call
const mockUsers: UserTableRow[] = [
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
  {
    id: "user_3",
    name: "Michael Johnson",
    email: "michael@example.com",
    emailVerified: false,
    image: null,
    createdAt: "2024-01-18T12:00:00Z",
    phoneNumber: "+233203456789",
    phoneNumberVerified: true,
    role: "user",
    banned: true,
    banReason: "Violation of terms",
    banExpires: "2024-02-18T12:00:00Z",
    address: "789 Pine Rd, Tamale",
    kycStatus: "rejected",
    status: "suspended",
    approvedAt: null,
    lastLogin: "2024-01-17T11:20:00Z",
    districtName: "Tamale Metropolitan",
    regionName: "Northern",
    organizationCount: 0,
    organizationNames: [],
  },
  {
    id: "user_4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-12T14:45:00Z",
    phoneNumber: null,
    phoneNumberVerified: null,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    address: "321 Elm St, Cape Coast",
    kycStatus: "pending",
    status: "pending",
    approvedAt: null,
    lastLogin: null,
    districtName: "Cape Coast Metropolitan",
    regionName: "Central",
    organizationCount: 1,
    organizationNames: ["Fishing Cooperative"],
  },
];

export function useUserListController() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserTableSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // In a real implementation, you would use a query hook here
  // const { data: users, isLoading, isFetching } = useUsersQuery({ search, sort });

  return {
    users: mockUsers,
    search,
    setSearch,
    sort,
    setSort,
    selectedIds,
    setSelectedIds,
    isLoading: false,
    isFetching: false,
  };
}