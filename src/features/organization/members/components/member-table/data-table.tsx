"use client";

import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { MemberColumn, MemberColumnKey, MemberTableRow } from "./columns";

export type SortState = {
	field: MemberColumnKey;
	direction: "asc" | "desc";
};

type DataTableProps = {
	data: MemberTableRow[];
	columns: MemberColumn[];
	sort?: SortState;
	onSortChange?: (sort: SortState) => void;
	onView?: (row: MemberTableRow) => void;
	onRemove?: (row: MemberTableRow) => void;
	onChangeRole?: (row: MemberTableRow) => void;
	isLoading?: boolean;
	isFetching?: boolean;
};

const SortIndicator = ({ direction }: { direction: "asc" | "desc" }) => (
	<span aria-hidden className="ml-1 flex size-3 items-center justify-center">
		<ArrowUpDown className="size-3" strokeWidth={2} />
		<span className="sr-only">Sorted {direction}</span>
	</span>
);

const ActionsCell = ({
	row,
	onView,
	onRemove,
	onChangeRole,
}: {
	row: MemberTableRow;
	onView?: (row: MemberTableRow) => void;
	onRemove?: (row: MemberTableRow) => void;
	onChangeRole?: (row: MemberTableRow) => void;
}) => {
	const isOwner = row.role === "owner";
	const canModify = !isOwner; // Owners typically can't be removed or have role changed

	return (
		<TableCell className="w-[56px] text-right px-3 py-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button aria-label="Open row actions" size="icon" variant="ghost">
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{onView && (
						<DropdownMenuItem onSelect={() => onView(row)}>
							View details
						</DropdownMenuItem>
					)}
					{canModify && (
						<>
							<DropdownMenuSeparator />
							{onChangeRole && (
								<DropdownMenuItem onSelect={() => onChangeRole(row)}>
									Change role
								</DropdownMenuItem>
							)}
							{onRemove && (
								<DropdownMenuItem
									className="text-destructive"
									onSelect={() => onRemove(row)}
								>
									Remove from organization
								</DropdownMenuItem>
							)}
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</TableCell>
	);
};

export const DataTable = ({
	data,
	columns,
	sort,
	onSortChange,
	onView,
	onRemove,
	onChangeRole,
	isLoading = false,
	isFetching = false,
}: DataTableProps) => {
	const handleSortClick = (key: MemberColumnKey, sortable?: boolean) => {
		if (!sortable || !onSortChange) {
			return;
		}

		if (sort?.field === key) {
			const nextDirection = sort.direction === "asc" ? "desc" : "asc";
			onSortChange({ field: key, direction: nextDirection });
			return;
		}

		onSortChange({ field: key, direction: "desc" });
	};

	const renderHeaderContent = (column: MemberColumn): ReactNode => {
		if (!column.sortable) {
			return column.header;
		}

		const isActiveSort = sort?.field === column.key;

		return (
			<Button
				aria-label={`Sort by ${column.header}`}
				className="-ml-2"
				onClick={() => handleSortClick(column.key, column.sortable)}
				size="sm"
				variant="ghost"
			>
				{column.header}
				{isActiveSort && sort && <SortIndicator direction={sort.direction} />}
			</Button>
		);
	};

	return (
		<div className="relative">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead
									className={cn(
										column.align === "right" && "text-right",
										column.widthClassName,
										"truncate",
										"px-3 py-2",
									)}
									key={column.key}
								>
									{renderHeaderContent(column)}
								</TableHead>
							))}
							<TableHead
								aria-label="Row actions"
								className="w-[56px] px-3 py-2"
							/>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 && !isLoading ? (
							<TableRow>
								<TableCell
									className="py-12 text-center text-muted-foreground"
									colSpan={columns.length + 1}
								>
									No members found.
								</TableCell>
							</TableRow>
						) : (
							data.map((row) => (
								<TableRow key={row.id}>
									{columns.map((column) => {
										const fallbackValue = (
											row as unknown as Record<
												MemberColumnKey,
												ReactNode | undefined
											>
										)[column.key];

										return (
											<TableCell
												className={cn(
													column.align === "right" && "text-right",
													"truncate",
													"px-3 py-2",
												)}
												key={column.key}
											>
												{column.render ? column.render(row) : fallbackValue}
											</TableCell>
										);
									})}
									<ActionsCell
										row={row}
										onView={onView}
										onRemove={onRemove}
										onChangeRole={onChangeRole}
									/>
								</TableRow>
							))
						)}
					</TableBody>
					<TableCaption>{isFetching ? "Refreshing members…" : ""}</TableCaption>
				</Table>
			</div>
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/60">
					<div className="text-sm text-muted-foreground">Loading members…</div>
				</div>
			)}
		</div>
	);
};
