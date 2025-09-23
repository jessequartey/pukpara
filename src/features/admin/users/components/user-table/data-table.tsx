"use client";

import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { USER_STATUS } from "@/config/constants/auth";
import { cn } from "@/lib/utils";

import type { UserColumn, UserColumnKey, UserTableRow } from "./columns";

export type SortState = {
	field: UserColumnKey;
	direction: "asc" | "desc";
};

type DataTableProps = {
	data: UserTableRow[];
	columns: UserColumn[];
	sort: SortState;
	onSortChange: (sort: SortState) => void;
	selectedIds: Set<string>;
	onToggleSelect: (rowId: string, checked: boolean) => void;
	onToggleSelectAll: (checked: boolean) => void;
	onApprove: (row: UserTableRow) => void;
	onReject: (row: UserTableRow) => void;
	onSuspend: (row: UserTableRow) => void;
	onBan: (row: UserTableRow) => void;
	onUnban: (row: UserTableRow) => void;
	onDelete: (row: UserTableRow) => void;
	onView: (row: UserTableRow) => void;
	onImpersonate: (row: UserTableRow) => void;
	isLoading?: boolean;
	isFetching?: boolean;
};

const SortIndicator = ({ direction }: { direction: "asc" | "desc" }) => (
	<span aria-hidden className="ml-1 flex size-3 items-center justify-center">
		<ArrowUpDown className="size-3" strokeWidth={2} />
		<span className="sr-only">Sorted {direction}</span>
	</span>
);

const SelectionHeaderCell = ({
	allSelected,
	someSelected,
	onToggle,
}: {
	allSelected: boolean;
	someSelected: boolean;
	onToggle: (checked: boolean) => void;
}) => {
	const handleChange = (value: boolean | "indeterminate") => {
		onToggle(value === true);
	};

	let checkboxState: boolean | "indeterminate" = false;
	if (allSelected) {
		checkboxState = true;
	} else if (someSelected) {
		checkboxState = "indeterminate";
	}

	return (
		<TableHead className="w-[48px]">
			<Checkbox
				aria-label="Select all users on this page"
				checked={checkboxState}
				onCheckedChange={handleChange}
			/>
		</TableHead>
	);
};

const SelectionCell = ({
	rowId,
	checked,
	onToggle,
}: {
	rowId: string;
	checked: boolean;
	onToggle: (rowId: string, checked: boolean) => void;
}) => {
	const handleChange = (value: boolean | "indeterminate") => {
		onToggle(rowId, value === true);
	};

	return (
		<TableCell className="w-[48px]">
			<Checkbox
				aria-label={`Select user ${rowId}`}
				checked={checked}
				onCheckedChange={handleChange}
			/>
		</TableCell>
	);
};

type ActionType = "approve" | "reject" | "suspend" | "ban" | "unban" | "delete";

type PendingAction = {
	type: ActionType;
	row: UserTableRow;
} | null;

const ActionsCell = ({
	row,
	onApprove,
	onReject,
	onSuspend,
	onBan,
	onUnban,
	onDelete,
	onView,
	onImpersonate,
	pendingAction,
	setPendingAction,
}: {
	row: UserTableRow;
	onApprove: (row: UserTableRow) => void;
	onReject: (row: UserTableRow) => void;
	onSuspend: (row: UserTableRow) => void;
	onBan: (row: UserTableRow) => void;
	onUnban: (row: UserTableRow) => void;
	onDelete: (row: UserTableRow) => void;
	onView: (row: UserTableRow) => void;
	onImpersonate: (row: UserTableRow) => void;
	pendingAction: PendingAction;
	setPendingAction: (action: PendingAction) => void;
}) => {
	const isActive = row.status === USER_STATUS.APPROVED;
	const isPending = row.status === USER_STATUS.PENDING;
	const isSuspended = row.status === USER_STATUS.SUSPENDED;
	const isBanned = row.banned;

	const handleAction = (type: ActionType) => {
		setPendingAction({ type, row });
	};

	return (
		<>
			<TableCell className="w-[56px] text-right">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button aria-label="Open row actions" size="icon" variant="ghost">
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onSelect={() => onView(row)}>
							View details
						</DropdownMenuItem>
						{isActive && (
							<DropdownMenuItem onSelect={() => onImpersonate(row)}>
								Impersonate user
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						{(isPending || isSuspended) && (
							<DropdownMenuItem onSelect={() => handleAction("approve")}>
								Approve
							</DropdownMenuItem>
						)}
						{(isPending || isActive) && (
							<DropdownMenuItem onSelect={() => handleAction("reject")}>
								Reject
							</DropdownMenuItem>
						)}
						{(isPending || isActive) && (
							<DropdownMenuItem onSelect={() => handleAction("suspend")}>
								Suspend
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						{isBanned ? (
							<DropdownMenuItem onSelect={() => handleAction("unban")}>
								Unban user
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onSelect={() => handleAction("ban")}>
								Ban user
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive"
							onSelect={() => handleAction("delete")}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>

			<AlertDialog
				onOpenChange={(open) => !open && setPendingAction(null)}
				open={pendingAction?.row.id === row.id}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{(() => {
								switch (pendingAction?.type) {
									case "approve":
										return "Approve User";
									case "reject":
										return "Reject User";
									case "suspend":
										return "Suspend User";
									case "ban":
										return "Ban User";
									case "unban":
										return "Unban User";
									case "delete":
										return "Delete User";
									default:
										return "";
								}
							})()}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{(() => {
								switch (pendingAction?.type) {
									case "approve":
										return `Are you sure you want to approve "${row.name}"? This will activate the user and set both status and KYC to approved.`;
									case "reject":
										return `Are you sure you want to reject "${row.name}"? This will set the user status to rejected.`;
									case "suspend":
										return `Are you sure you want to suspend "${row.name}"? This will suspend the user from accessing the platform.`;
									case "ban":
										return `Are you sure you want to ban "${row.name}"? This will permanently ban the user from the platform.`;
									case "unban":
										return `Are you sure you want to unban "${row.name}"? This will restore their access to the platform.`;
									case "delete":
										return `Are you sure you want to delete "${row.name}"? This action cannot be undone and will remove all associated data.`;
									default:
										return "";
								}
							})()}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className={
								pendingAction?.type === "delete" ||
								pendingAction?.type === "ban"
									? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
									: ""
							}
							onClick={() => {
								switch (pendingAction?.type) {
									case "approve":
										onApprove(row);
										break;
									case "reject":
										onReject(row);
										break;
									case "suspend":
										onSuspend(row);
										break;
									case "ban":
										onBan(row);
										break;
									case "unban":
										onUnban(row);
										break;
									case "delete":
										onDelete(row);
										break;
									default:
										break;
								}
								setPendingAction(null);
							}}
						>
							{(() => {
								switch (pendingAction?.type) {
									case "approve":
										return "Approve";
									case "reject":
										return "Reject";
									case "suspend":
										return "Suspend";
									case "ban":
										return "Ban";
									case "unban":
										return "Unban";
									case "delete":
										return "Delete";
									default:
										return "";
								}
							})()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export const DataTable = ({
	data,
	columns,
	sort,
	onSortChange,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
	onApprove,
	onReject,
	onSuspend,
	onBan,
	onUnban,
	onDelete,
	onView,
	onImpersonate,
	isLoading = false,
	isFetching = false,
}: DataTableProps) => {
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);
	const allCurrentSelected =
		data.length > 0 && data.every((row) => selectedIds.has(row.id));
	const someSelected =
		!allCurrentSelected && data.some((row) => selectedIds.has(row.id));

	const handleSortClick = (key: UserColumnKey, sortable?: boolean) => {
		if (!sortable) {
			return;
		}

		// Only allow sorting on fields that the API supports
		const validSortFields = [
			"name",
			"status",
			"kycStatus",
			"lastLogin",
			"createdAt",
		] as const;
		if (!validSortFields.includes(key as (typeof validSortFields)[number])) {
			return;
		}

		if (sort.field === key) {
			const nextDirection = sort.direction === "asc" ? "desc" : "asc";
			onSortChange({ field: key, direction: nextDirection });
			return;
		}

		onSortChange({ field: key, direction: "desc" });
	};

	const renderHeaderContent = (column: UserColumn): ReactNode => {
		if (!column.sortable) {
			return column.header;
		}

		const isActiveSort = sort.field === column.key;

		return (
			<Button
				aria-label={`Sort by ${column.header}`}
				className="-ml-2"
				onClick={() => handleSortClick(column.key, column.sortable)}
				size="sm"
				variant="ghost"
			>
				{column.header}
				{isActiveSort && <SortIndicator direction={sort.direction} />}
			</Button>
		);
	};

	return (
		<div className="relative">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<SelectionHeaderCell
								allSelected={allCurrentSelected}
								onToggle={onToggleSelectAll}
								someSelected={someSelected}
							/>
							{columns.map((column) => (
								<TableHead
									className={cn(
										column.align === "right" && "text-right",
										column.widthClassName,
										"whitespace-nowrap",
									)}
									key={column.key}
								>
									{renderHeaderContent(column)}
								</TableHead>
							))}
							<TableHead aria-label="Row actions" className="w-[56px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 && !isLoading ? (
							<TableRow>
								<TableCell
									className="py-12 text-center text-muted-foreground"
									colSpan={columns.length + 2}
								>
									No users match the current filters.
								</TableCell>
							</TableRow>
						) : (
							data.map((row) => (
								<TableRow data-selected={selectedIds.has(row.id)} key={row.id}>
									<SelectionCell
										checked={selectedIds.has(row.id)}
										onToggle={onToggleSelect}
										rowId={row.id}
									/>
									{columns.map((column) => {
										const fallbackValue = (
											row as unknown as Record<
												UserColumnKey,
												ReactNode | undefined
											>
										)[column.key];

										return (
											<TableCell
												className={cn(
													column.align === "right" && "text-right",
													"whitespace-nowrap",
												)}
												key={column.key}
											>
												{column.render ? column.render(row) : fallbackValue}
											</TableCell>
										);
									})}
									<ActionsCell
										onApprove={onApprove}
										onBan={onBan}
										onDelete={onDelete}
										onImpersonate={onImpersonate}
										onReject={onReject}
										onSuspend={onSuspend}
										onUnban={onUnban}
										onView={onView}
										pendingAction={pendingAction}
										row={row}
										setPendingAction={setPendingAction}
									/>
								</TableRow>
							))
						)}
					</TableBody>
					<TableCaption>{isFetching ? "Refreshing users…" : ""}</TableCaption>
				</Table>
			</div>
			{isLoading ? (
				<div className="absolute inset-0 flex items-center justify-center bg-background/60">
					<Badge variant="secondary">Loading users…</Badge>
				</div>
			) : null}
		</div>
	);
};
