import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { USER_STATUS } from "@/config/constants/auth";

export type MemberTableRow = {
	id: string;
	memberId: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
	status: string | null;
	kycStatus: string | null;
	phoneNumber: string | null;
	phoneNumberVerified: boolean;
	lastLogin: Date | string | null;
	createdAt: Date | string | null;
	districtName: string | null;
	regionName: string | null;
	banned: boolean;
	banReason: string | null;
};

export type MemberColumnKey =
	| "name"
	| "contact"
	| "location"
	| "role"
	| "status"
	| "joinedAt";

export type MemberColumn = {
	key: MemberColumnKey;
	header: string;
	sortable?: boolean;
	align?: "left" | "right";
	widthClassName?: string;
	render?: (row: MemberTableRow) => ReactNode;
};

const statusLabels: Record<string, string> = {
	[USER_STATUS.PENDING]: "Pending",
	[USER_STATUS.APPROVED]: "Active",
	[USER_STATUS.SUSPENDED]: "Suspended",
	[USER_STATUS.REJECTED]: "Rejected",
};

const roleLabels: Record<string, string> = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
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

const toTitleCase = (value: string | null) => {
	if (!value) {
		return "";
	}

	const lower = value.toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const memberColumns: MemberColumn[] = [
	{
		key: "name",
		header: "Member",
		sortable: true,
		render: (row) => (
			<div className="flex min-w-0 items-start gap-3">
				<Avatar className="size-9 flex-shrink-0">
					{row.image ? (
						<AvatarImage alt={row.name} src={row.image} />
					) : (
						<AvatarFallback>
							{row.name
								.split(" ")
								.map((part) => part.charAt(0))
								.join("")
								.slice(0, 2)
								.toUpperCase() || "M"}
						</AvatarFallback>
					)}
				</Avatar>
				<div className="flex min-w-0 flex-col gap-1">
					<span className="truncate font-medium text-foreground">
						{row.name}
					</span>
				</div>
			</div>
		),
	},
	{
		key: "contact",
		header: "Contact",
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm">{row.email}</span>
				{row.phoneNumber && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground text-xs">
							{row.phoneNumber}
						</span>
						{row.phoneNumberVerified && (
							<Badge variant="outline" className="h-4 px-1 text-xs">
								✓
							</Badge>
						)}
					</div>
				)}
			</div>
		),
	},
	{
		key: "location",
		header: "Location",
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm">{row.regionName ?? "—"}</span>
				<span className="text-muted-foreground text-xs">
					{row.districtName ?? "—"}
				</span>
			</div>
		),
	},
	{
		key: "role",
		header: "Role",
		sortable: true,
		render: (row) => {
			const label = roleLabels[row.role] ?? toTitleCase(row.role);
			const variant =
				row.role === "owner"
					? "default"
					: row.role === "admin"
						? "secondary"
						: "outline";

			return <Badge variant={variant}>{label}</Badge>;
		},
	},
	{
		key: "status",
		header: "Status",
		sortable: true,
		render: (row) => {
			if (row.banned) {
				return (
					<div className="flex flex-col gap-1">
						<Badge variant="destructive">Banned</Badge>
						{row.banReason && (
							<span className="text-muted-foreground text-xs">
								{row.banReason}
							</span>
						)}
					</div>
				);
			}

			const status = row.status ?? "";
			const label = statusLabels[status] ?? toTitleCase(status);
			const variant =
				status === USER_STATUS.APPROVED
					? "default"
					: status === USER_STATUS.REJECTED
						? "destructive"
						: "secondary";

			return <Badge variant={variant}>{label}</Badge>;
		},
	},
	{
		key: "joinedAt",
		header: "Joined",
		sortable: true,
		render: (row) => (
			<span className="text-muted-foreground text-xs">
				{formatMaybeDate(row.createdAt)}
			</span>
		),
	},
];
