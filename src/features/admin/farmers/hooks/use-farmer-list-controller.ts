"use client";

import { useMemo, useState } from "react";

import { api } from "@/trpc/react";

import type { FarmerTableRow } from "../components/farmer-table/columns";
import type { FarmerTableSortState } from "../components/farmer-table/index";

const ROW_OPTION_SMALL = 10;
const ROW_OPTION_MEDIUM = 20;
const ROW_OPTION_LARGE = 50;

export const ROW_OPTIONS = [
	ROW_OPTION_SMALL,
	ROW_OPTION_MEDIUM,
	ROW_OPTION_LARGE,
] as const;

export function useFarmerListController() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] =
		useState<(typeof ROW_OPTIONS)[number]>(ROW_OPTION_MEDIUM);
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
	const allFarmers = useMemo(() => {
		if (!farmersData) {
			return [];
		}

		let filtered = farmersData;

		// Apply search filter
		if (search.trim()) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(farmer) =>
					farmer.name.toLowerCase().includes(searchLower) ||
					farmer.pukparaId.toLowerCase().includes(searchLower) ||
					farmer.phone?.toLowerCase().includes(searchLower) ||
					farmer.address.toLowerCase().includes(searchLower) ||
					farmer.community?.toLowerCase().includes(searchLower) ||
					farmer.districtName?.toLowerCase().includes(searchLower) ||
					farmer.regionName?.toLowerCase().includes(searchLower) ||
					farmer.organizationName?.toLowerCase().includes(searchLower),
			);
		}

		// Apply simple sorting
		const sorted = [...filtered].sort((a, b) => {
			const getFieldValue = (item: typeof a, field: string) => {
				if (field === "name") {
					return item.name;
				}
				if (field === "createdAt") {
					return new Date(item.createdAt || 0);
				}
				return null;
			};

			const aValue = getFieldValue(a, sort.field);
			const bValue = getFieldValue(b, sort.field);

			if (aValue === null || aValue === undefined) {
				return 1;
			}
			if (bValue === null || bValue === undefined) {
				return -1;
			}

			let comparison = 0;
			if (aValue < bValue) {
				comparison = -1;
			}
			if (aValue > bValue) {
				comparison = 1;
			}

			return sort.direction === "desc" ? -comparison : comparison;
		});

		return sorted;
	}, [farmersData, search, sort]);

	// Calculate pagination
	const total = allFarmers.length;
	const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const farmers = allFarmers.slice(startIndex, endIndex);

	const startRow = total === 0 ? 0 : startIndex + 1;
	const endRow = Math.min(endIndex, total);

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

	return {
		farmers: farmers as FarmerTableRow[],
		search,
		setSearch,
		page,
		setPage,
		pageSize,
		setPageSize,
		sort,
		setSort,
		selectedIds,
		setSelectedIds,
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
