import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import { ROW_OPTIONS } from "../../hooks/use-farmer-list-controller";
import { FarmerTable } from "../farmer-table";
import type { FarmerColumnKey, FarmerTableRow } from "../farmer-table/columns";
import { farmerColumns } from "../farmer-table/columns";
import type { FarmerTableSortState } from "../farmer-table/index";
import { PaginationControls } from "./pagination-controls";

type FarmerDirectoryController = {
	farmers: FarmerTableRow[];
	search: string;
	setSearch: (search: string) => void;
	page: number;
	setPage: (page: number) => void;
	pageSize: (typeof ROW_OPTIONS)[number];
	setPageSize: (pageSize: (typeof ROW_OPTIONS)[number]) => void;
	sort: FarmerTableSortState;
	setSort: (sort: FarmerTableSortState) => void;
	selectedIds: Set<string>;
	setSelectedIds: (ids: Set<string>) => void;
	total: number;
	totalPages: number;
	startRow: number;
	endRow: number;
	handleSelectRow: (id: string, checked: boolean) => void;
	handleSelectAll: (checked: boolean) => void;
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
	const deleteMutation = api.admin.farmers.delete.useMutation();

	const allColumnKeys = useMemo(
		() => farmerColumns.map((column) => column.key as FarmerColumnKey),
		[],
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
		page,
		setPage,
		pageSize,
		setPageSize,
		sort,
		setSort,
		selectedIds,
		total,
		totalPages,
		startRow,
		endRow,
		handleSelectRow,
		handleSelectAll,
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

	const handleApprove = async (row: FarmerTableRow) => {
		try {
			setIsActionLoading(true);
			await approveMutation.mutateAsync({ farmerIds: [row.id] });
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
			await rejectMutation.mutateAsync({ farmerIds: [row.id] });
			await utils.admin.farmers.all.invalidate();
			toast.success(`${row.name} has been rejected.`);
		} catch {
			toast.error("Failed to reject farmer. Please try again.");
		} finally {
			setIsActionLoading(false);
		}
	};

	const handleDelete = async (row: FarmerTableRow) => {
		try {
			setIsActionLoading(true);
			await deleteMutation.mutateAsync({ farmerIds: [row.id] });
			await utils.admin.farmers.all.invalidate();
			toast.success(`${row.name} has been deleted.`);
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
						placeholder="Search by name, Pukpara ID, phone, location, organization, or community..."
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
				<div className="max-h-[60vh] overflow-y-auto">
					<FarmerTable
						data={farmers}
						isFetching={isFetching}
						isLoading={isLoading || isActionLoading}
						onApprove={handleApprove}
						onDelete={handleDelete}
						onReject={handleReject}
						onSelectAll={handleSelectAll}
						onSelectRow={handleSelectRow}
						onSortChange={setSort}
						onView={handleView}
						selectedIds={selectedIds}
						sort={sort}
						visibleColumnKeys={visibleColumnKeys}
					/>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
					<span>
						Showing {startRow}–{endRow} of {total}
					</span>
					<div className="flex items-center gap-2">
						<span className="text-xs uppercase tracking-wide">Rows</span>
						<div className="flex items-center gap-1">
							{ROW_OPTIONS.map((option) => (
								<Button
									key={option}
									onClick={() => {
										setPageSize(option as (typeof ROW_OPTIONS)[number]);
										setPage(1);
									}}
									size="sm"
									type="button"
									variant={option === pageSize ? "secondary" : "ghost"}
								>
									{option}
								</Button>
							))}
						</div>
					</div>
					{isFetching ? <Badge variant="outline">Refreshing…</Badge> : null}
				</div>
				<PaginationControls
					isLoading={isFetching}
					onPageChange={(nextPage) =>
						setPage(Math.max(1, Math.min(totalPages, nextPage)))
					}
					page={page}
					totalPages={totalPages}
				/>
			</CardFooter>
		</Card>
	);
}
