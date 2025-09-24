"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter as DialogFooterRoot,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { OrganizationTable } from "@/features/admin/organizations/components/organization-table";
import {
	type OrganizationColumnKey,
	organizationColumns,
} from "@/features/admin/organizations/components/organization-table/columns";
import type { UseOrganizationListControllerReturn } from "@/features/admin/organizations/hooks/use-organization-list-controller";
import { ROW_OPTIONS } from "@/features/admin/organizations/hooks/use-organization-list-controller";

import { PaginationControls } from "./pagination-controls";
import { SelectionToolbar } from "./selection-toolbar";

export type OrganizationDirectoryCardProps = {
	controller: UseOrganizationListControllerReturn;
};

const SKELETON_MAX_ROWS = 6;
const SKELETON_MIN_ROWS = 3;
const FALLBACK_COLUMN_KEY: OrganizationColumnKey = "name";

export function OrganizationDirectoryCard({
	controller,
}: OrganizationDirectoryCardProps) {
	const allColumnKeys = useMemo(
		() =>
			organizationColumns.map((column) => column.key as OrganizationColumnKey),
		[],
	);
	const [visibleColumnKeys, setVisibleColumnKeys] = useState<
		Set<OrganizationColumnKey>
	>(() => new Set(allColumnKeys));
	useEffect(() => {
		if (visibleColumnKeys.size === 0 && allColumnKeys.length > 0) {
			setVisibleColumnKeys(new Set(allColumnKeys));
		}
	}, [allColumnKeys, visibleColumnKeys]);
	const {
		search,
		setSearch,
		page,
		setPage,
		pageSize,
		setPageSize,
		sort,
		selectedIds,
		confirmAction,
		setConfirmAction,
		data,
		total,
		totalPages,
		startRow,
		endRow,
		listQuery,
		handleSortChange,
		handleSelectRow,
		handleSelectAll,
		handleApproveSingle,
		handleRejectSingle,
		handleSuspendSingle,
		handleDeleteSingle,
		handleView,
		handleBulkAction,
		isBusy,
	} = controller;

	const hasSelection = selectedIds.size > 0;
	const visibleCount = visibleColumnKeys.size;
	const activeColumnKeys =
		visibleCount > 0
			? allColumnKeys.filter((key) => visibleColumnKeys.has(key))
			: allColumnKeys;
	let skeletonColumnKeys: OrganizationColumnKey[];
	if (activeColumnKeys.length > 0) {
		skeletonColumnKeys = activeColumnKeys;
	} else if (allColumnKeys.length > 0) {
		skeletonColumnKeys = allColumnKeys;
	} else {
		skeletonColumnKeys = [FALLBACK_COLUMN_KEY];
	}
	const skeletonRowCount = Math.min(pageSize, SKELETON_MAX_ROWS);
	const showTableSkeleton = listQuery.isLoading;

	const toggleColumn = (key: OrganizationColumnKey) => {
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

	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-4 border-b pb-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Input
						aria-label="Search organizations"
						className="w-full sm:max-w-lg"
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by name, slug, or contact"
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
							{organizationColumns.map((column) => {
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
				{hasSelection ? (
					<SelectionToolbar
						count={selectedIds.size}
						isBusy={isBusy}
						onApprove={() => setConfirmAction("approve")}
						onDelete={() => setConfirmAction("delete")}
					/>
				) : null}
				<div className="max-h-[60vh] overflow-y-auto">
					{showTableSkeleton ? (
						<OrganizationTableSkeleton
							columnKeys={skeletonColumnKeys}
							rowCount={skeletonRowCount}
						/>
					) : (
						<OrganizationTable
							data={data}
							isFetching={listQuery.isFetching}
							isLoading={listQuery.isLoading}
							onApprove={handleApproveSingle}
							onDelete={handleDeleteSingle}
							onReject={handleRejectSingle}
							onSelectAll={handleSelectAll}
							onSelectRow={handleSelectRow}
							onSortChange={handleSortChange}
							onSuspend={handleSuspendSingle}
							onView={handleView}
							selectedIds={selectedIds}
							sort={sort}
							visibleColumnKeys={visibleColumnKeys}
						/>
					)}
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
										setPageSize(option);
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
					{listQuery.isFetching ? (
						<Badge variant="outline">Refreshing…</Badge>
					) : null}
				</div>
				<PaginationControls
					isLoading={listQuery.isFetching}
					onPageChange={(nextPage) =>
						setPage(Math.max(1, Math.min(totalPages, nextPage)))
					}
					page={page}
					totalPages={totalPages}
				/>
			</CardFooter>

			<Dialog
				onOpenChange={(open) => {
					if (!open) {
						setConfirmAction(null);
					}
				}}
				open={confirmAction !== null}
			>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>
							{confirmAction === "approve"
								? "Approve selected organizations"
								: "Delete selected organizations"}
						</DialogTitle>
						<DialogDescription>
							{confirmAction === "approve"
								? "Approving will activate these organizations and notify their owners."
								: "Deleting removes the organizations and all membership records."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooterRoot>
						<Button
							disabled={isBusy}
							onClick={() => setConfirmAction(null)}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							disabled={isBusy}
							onClick={async () => {
								await handleBulkAction();
								setConfirmAction(null);
							}}
							type="button"
							variant={confirmAction === "delete" ? "destructive" : "default"}
						>
							{confirmAction === "delete" ? "Delete" : "Approve"}
						</Button>
					</DialogFooterRoot>
				</DialogContent>
			</Dialog>
		</Card>
	);
}

type OrganizationTableSkeletonProps = {
	columnKeys: OrganizationColumnKey[];
	rowCount: number;
};

const OrganizationTableSkeleton = ({
	columnKeys,
	rowCount,
}: OrganizationTableSkeletonProps) => {
	const headerKeys = columnKeys.length > 0 ? columnKeys : [FALLBACK_COLUMN_KEY];
	const rowKeys = Array.from(
		{ length: Math.max(SKELETON_MIN_ROWS, rowCount) },
		(_, index) => `row-${index}`,
	);

	return (
		<div className="overflow-hidden rounded-md border">
			<table className="w-full">
				<thead className="bg-muted/40">
					<tr className="border-b">
						<th className="w-[48px] px-4 py-3">
							<Skeleton className="h-4 w-4 rounded-sm" />
						</th>
						{headerKeys.map((columnKey) => (
							<th className="px-4 py-3" key={`header-${columnKey}`}>
								<Skeleton className="h-4 w-24" />
							</th>
						))}
						<th className="w-[56px] px-4 py-3 text-right">
							<Skeleton className="h-4 w-4" />
						</th>
					</tr>
				</thead>
				<tbody>
					{rowKeys.map((rowKey) => (
						<tr className="border-b last:border-b-0" key={rowKey}>
							<td className="px-4 py-3">
								<Skeleton className="h-4 w-4 rounded-sm" />
							</td>
							{headerKeys.map((columnKey) => (
								<td className="px-4 py-3" key={`${rowKey}-${columnKey}`}>
									<Skeleton className="h-4 w-full" />
								</td>
							))}
							<td className="px-4 py-3 text-right">
								<Skeleton className="h-4 w-6" />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
