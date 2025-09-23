import type { ReactNode } from "react";

export type FarmerTableRow = {
	id: string;
	pukparaId: string;
	name: string;
	firstName: string;
	lastName: string;
	gender: string | null;
	dateOfBirth: Date | null;
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
	createdAt: Date | null;
	updatedAt: Date | null;
	districtId: string | null;
	districtName: string | null;
	regionName: string | null;
	organizationId: string;
	organizationName: string | null;
	farmCount: number;
	totalAcreage: number;
};

export type FarmerColumnKey =
	| "name"
	| "contact"
	| "location"
	| "kycStatus"
	| "organization"
	| "farming"
	| "createdAt";

export type FarmerColumn = {
	key: FarmerColumnKey;
	header: string;
	sortable?: boolean;
	align?: "left" | "right";
	widthClassName?: string;
	render?: (row: FarmerTableRow) => ReactNode;
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

export const farmerColumns: FarmerColumn[] = [
	{
		key: "name",
		header: "Farmer",
		sortable: true,
		render: (row) => (
			<span className="truncate font-medium text-foreground">{row.name}</span>
		),
	},
	{
		key: "contact",
		header: "Contact",
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm">{row.pukparaId}</span>
				{row.phone && (
					<span className="text-muted-foreground text-xs">{row.phone}</span>
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
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm capitalize">{row.kycStatus}</span>
				{row.isLeader && (
					<span className="text-muted-foreground text-xs">Leader</span>
				)}
			</div>
		),
	},
	{
		key: "organization",
		header: "Organization",
		render: (row) => (
			<div className="flex flex-col gap-1">
				<span className="text-sm">{row.organizationName ?? "—"}</span>
				{row.community && (
					<span className="text-muted-foreground text-xs">{row.community}</span>
				)}
			</div>
		),
	},
	{
		key: "farming",
		header: "Farming",
		align: "right",
		render: (row) => (
			<div className="flex flex-col gap-1 text-right">
				<span className="text-sm tabular-nums">{row.farmCount} farms</span>
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
		header: "Created",
		sortable: true,
		render: (row) => (
			<span className="text-muted-foreground text-xs">
				{formatMaybeDate(row.createdAt)}
			</span>
		),
	},
];
