import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type FarmerTableRow = {
	id: string;
	pukparaId: string;
	name: string;
	firstName: string;
	lastName: string;
	gender: string | null;
	dateOfBirth: Date | string | null;
	phone: string | null;
	isPhoneSmart: boolean;
	idNumber: string | null;
	idType: string | null;
	address: string;
	community: string | null;
	householdSize: number | null;
	isLeader: boolean;
	imgUrl: string | null;
	kycStatus: string;
	createdAt: Date | string | null;
	updatedAt: Date | string | null;
	districtName: string | null;
	regionName: string | null;
	farmCount: number;
	totalAcreage: number;
};

export type FarmerColumnKey =
	| "name"
	| "contact"
	| "location"
	| "kycStatus"
	| "farms"
	| "createdAt";

export type FarmerColumn = {
	key: FarmerColumnKey;
	header: string;
	sortable?: boolean;
	align?: "left" | "right";
	widthClassName?: string;
	render?: (row: FarmerTableRow) => ReactNode;
};

const kycStatusLabels: Record<string, string> = {
	pending: "Pending",
	verified: "Verified",
	rejected: "Rejected",
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

export const farmerColumns: FarmerColumn[] = [
	{
		key: "name",
		header: "Farmer",
		sortable: true,
		render: (row) => (
			<div className="flex min-w-0 items-start gap-3">
				<Avatar className="size-9 flex-shrink-0">
					{row.imgUrl ? (
						<AvatarImage alt={row.name} src={row.imgUrl} />
					) : (
						<AvatarFallback>
							{row.name
								.split(" ")
								.map((part) => part.charAt(0))
								.join("")
								.slice(0, 2)
								.toUpperCase() || "F"}
						</AvatarFallback>
					)}
				</Avatar>
				<div className="flex min-w-0 flex-col gap-1">
					<span className="truncate font-medium text-foreground">
						{row.name}
					</span>
					<span className="text-muted-foreground text-xs">{row.pukparaId}</span>
					{row.isLeader && (
						<Badge variant="outline" className="w-fit text-xs">
							Leader
						</Badge>
					)}
				</div>
			</div>
		),
	},
	{
		key: "contact",
		header: "Contact",
		render: (row) => (
			<div className="flex flex-col gap-1">
				{row.phone ? (
					<div className="flex items-center gap-1">
						<span className="text-sm">{row.phone}</span>
						{row.isPhoneSmart && (
							<Badge variant="outline" className="h-4 px-1 text-xs">
								📱
							</Badge>
						)}
					</div>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
				{row.community && (
					<span className="text-muted-foreground text-xs">{row.community}</span>
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
		key: "kycStatus",
		header: "KYC Status",
		sortable: true,
		render: (row) => {
			const label =
				kycStatusLabels[row.kycStatus] ?? toTitleCase(row.kycStatus);
			const variant =
				row.kycStatus === "verified"
					? "default"
					: row.kycStatus === "rejected"
						? "destructive"
						: "secondary";

			return <Badge variant={variant}>{label}</Badge>;
		},
	},
	{
		key: "farms",
		header: "Farms",
		align: "right",
		render: (row) => (
			<div className="flex flex-col gap-1 text-right">
				<span className="text-sm tabular-nums">{row.farmCount}</span>
				{row.totalAcreage > 0 && (
					<span className="text-muted-foreground text-xs">
						{row.totalAcreage.toFixed(1)} acres
					</span>
				)}
			</div>
		),
	},
	{
		key: "createdAt",
		header: "Registered",
		sortable: true,
		render: (row) => (
			<span className="text-muted-foreground text-xs">
				{formatMaybeDate(row.createdAt)}
			</span>
		),
	},
];
