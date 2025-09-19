import type { ReactNode } from "react";

export type FarmerTableRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date | string | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | string | null;
  address: string;
  status: string | null;
  approvedAt: Date | string | null;
  districtName: string | null;
  regionName: string | null;
  organizationCount: number;
  organizationNames: string[];
  farmSize: number | null; // in acres/hectares
  farmLocation: string | null;
  cropTypes: string[];
  certifications: string[];
};

export type FarmerColumnKey =
  | "name"
  | "contact"
  | "location"
  // | "status"
  | "organizations"
  // | "farming"
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
        <span className="text-sm">{row.email}</span>
        {row.phoneNumber && (
          <span className="text-muted-foreground text-xs">
            {row.phoneNumber}
          </span>
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
    key: "organizations",
    header: "Organizations",
    align: "right",
    render: (row) => (
      <div className="flex flex-col gap-1 text-right">
        <span className="text-sm tabular-nums">{row.organizationCount}</span>
        {row.organizationNames.length > 0 && (
          <span className="max-w-32 truncate text-muted-foreground text-xs">
            {row.organizationNames.slice(0, 2).join(", ")}
            {row.organizationNames.length > 2 &&
              ` +${row.organizationNames.length - 2}`}
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
