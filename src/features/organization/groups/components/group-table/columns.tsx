import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export type GroupTableRow = {
	id: string;
	name: string;
	createdAt: Date | string | null;
	updatedAt: Date | string | null;
	memberCount: number;
	farmerCount: number;
	totalParticipants: number;
};

export type GroupColumnKey =
	| "name"
	| "participants"
	| "members"
	| "farmers"
	| "createdAt";

export type GroupColumn = {
	key: GroupColumnKey;
	header: string;
	sortable?: boolean;
	align?: "left" | "right";
	widthClassName?: string;
	render?: (row: GroupTableRow) => ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});

const formatMaybeDate = (value: Date | string | null) => {
	if (!value) {
		return "";
	}

	const parsed = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(parsed.getTime())) {
		return "";
	}

	return dateFormatter.format(parsed);
};

export const groupColumns: GroupColumn[] = [
	{
		key: "name",
		header: "Group Name",
		sortable: true,
		render: (row) => (
			<div className="flex min-w-0 flex-col gap-1">
				<span className="truncate font-medium text-foreground">{row.name}</span>
			</div>
		),
	},
	{
		key: "participants",
		header: "Total Participants",
		align: "right",
		sortable: true,
		render: (row) => (
			<div className="flex flex-col gap-1 text-right">
				<span className="text-sm tabular-nums font-medium">
					{row.totalParticipants}
				</span>
			</div>
		),
	},
	{
		key: "members",
		header: "Members",
		align: "right",
		render: (row) => (
			<div className="flex flex-col gap-1 text-right">
				<span className="text-sm tabular-nums">{row.memberCount}</span>
				{row.memberCount > 0 && (
					<Badge variant="secondary" className="w-fit ml-auto text-xs">
						Users
					</Badge>
				)}
			</div>
		),
	},
	{
		key: "farmers",
		header: "Farmers",
		align: "right",
		render: (row) => (
			<div className="flex flex-col gap-1 text-right">
				<span className="text-sm tabular-nums">{row.farmerCount}</span>
				{row.farmerCount > 0 && (
					<Badge variant="outline" className="w-fit ml-auto text-xs">
						Farmers
					</Badge>
				)}
			</div>
		),
	},
	{
		key: "createdAt",
		header: "Created",
		sortable: true,
		render: (row) => (
			<span className="text-muted-foreground text-xs">
				{formatMaybeDate(row.createdAt)}
			</span>
		),
	},
];
