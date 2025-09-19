"use client";

import { useMemo, useState } from "react";

import { api } from "@/trpc/react";

import type { FarmerTableRow } from "../components/farmer-table/columns";
import type { FarmerTableSortState } from "../components/farmer-table/index";

export function useFarmerListController() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<FarmerTableSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    data: farmersData,
    isLoading,
    isFetching,
  } = api.admin.farmers.all.useQuery();

  // Client-side filtering and sorting
  const farmers = useMemo(() => {
    if (!farmersData) return [];

    let filtered = farmersData;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(searchLower) ||
          farmer.email.toLowerCase().includes(searchLower) ||
          farmer.phoneNumber?.toLowerCase().includes(searchLower) ||
          farmer.address.toLowerCase().includes(searchLower) ||
          farmer.districtName?.toLowerCase().includes(searchLower) ||
          farmer.regionName?.toLowerCase().includes(searchLower) ||
          farmer.organizationNames.some((name) =>
            name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sort.field) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sort.direction === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [farmersData, search, sort]);

  return {
    farmers: farmers as FarmerTableRow[],
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
