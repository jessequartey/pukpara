import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  // ORGANIZATION_KYC_STATUS,
  ORGANIZATION_STATUS,
  ORGANIZATION_TYPE,
} from "@/config/constants/auth";

export type OrganizationTableRow = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  status: string | null;
  kycStatus: string | null;
  type: string | null;
  subType: string | null;
  createdAt: Date | string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  memberCount: number;
  maxUsers: number | null;
  subscriptionType: string | null;
  licenseStatus: string | null;
  regionName: string | null;
  districtName: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type OrganizationColumnKey =
  | "name"
  | "type"
  | "contact"
  | "region"
  | "users"
  | "license"
  | "status"
  | "kycStatus"
  | "createdAt"
  | "owner";

export type OrganizationColumn = {
  key: OrganizationColumnKey;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  widthClassName?: string;
  render?: (row: OrganizationTableRow) => ReactNode;
};

const typeLabels: Record<string, string> = {
  [ORGANIZATION_TYPE.FARMER_ORG]: "Farmer org",
  [ORGANIZATION_TYPE.SUPPLIER]: "Supplier",
  [ORGANIZATION_TYPE.FINANCIAL]: "Financial",
  [ORGANIZATION_TYPE.BUYER]: "Buyer",
};

const statusLabels: Record<string, string> = {
  [ORGANIZATION_STATUS.PENDING]: "Pending",
  [ORGANIZATION_STATUS.ACTIVE]: "Active",
  [ORGANIZATION_STATUS.SUSPENDED]: "Suspended",
};

// const kycLabels: Record<string, string> = {
//   [ORGANIZATION_KYC_STATUS.PENDING]: "Pending",
//   [ORGANIZATION_KYC_STATUS.VERIFIED]: "Verified",
//   [ORGANIZATION_KYC_STATUS.REJECTED]: "Rejected",
// };

// const subscriptionLabels: Record<string, string> = {
//   freemium: "Freemium",
//   paid: "Paid",
//   enterprise: "Enterprise",
// };

// const licenseLabels: Record<string, string> = {
//   issued: "Issued",
//   expired: "Expired",
//   revoked: "Revoked",
// };

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

export const organizationColumns: OrganizationColumn[] = [
  {
    key: "name",
    header: "Organization",
    sortable: true,
    render: (row) => (
      <div className="flex min-w-0 items-start gap-3">
        <Avatar className="size-9 flex-shrink-0">
          {row.logo ? (
            <AvatarImage alt={row.name} src={row.logo} />
          ) : (
            <AvatarFallback>
              {row.name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase() || "P"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium text-foreground">
            {row.name}
          </span>
          <span className="truncate text-muted-foreground text-xs">
            {row.contactEmail ?? "—"}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    sortable: true,
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline">
          {typeLabels[row.type ?? ""] ?? toTitleCase(row.type)}
        </Badge>
        {row.subType ? (
          <Badge variant="secondary">{toTitleCase(row.subType)}</Badge>
        ) : null}
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contact",
    render: (row) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm">{row.contactEmail ?? "—"}</span>
        <span className="text-muted-foreground text-xs">
          {row.contactPhone ?? "—"}
        </span>
      </div>
    ),
  },
  {
    key: "region",
    header: "Region",
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
    key: "users",
    header: "Users",
    align: "right",
    render: (row) => (
      <span className="text-sm tabular-nums">
        {row.memberCount}
        {row.maxUsers ? ` / ${row.maxUsers}` : ""}
      </span>
    ),
  },
  // {
  //   key: "license",
  //   header: "License",
  //   render: (row) => (
  //     <div className="flex flex-col gap-1">
  //       <span className="text-sm">
  //         {subscriptionLabels[row.subscriptionType ?? ""] ??
  //           toTitleCase(row.subscriptionType)}
  //       </span>
  //       <span className="text-muted-foreground text-xs">
  //         {licenseLabels[row.licenseStatus ?? ""] ??
  //           toTitleCase(row.licenseStatus)}
  //       </span>
  //     </div>
  //   ),
  // },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row) => {
      const status = row.status ?? "";
      const label = statusLabels[status] ?? toTitleCase(status);
      const variant =
        status === ORGANIZATION_STATUS.ACTIVE ? "default" : "secondary";

      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  // {
  //   key: "kycStatus",
  //   header: "KYC",
  //   sortable: true,
  //   render: (row) => (
  //     <Badge variant="outline">
  //       {kycLabels[row.kycStatus ?? ""] ?? toTitleCase(row.kycStatus)}
  //     </Badge>
  //   ),
  // },
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
  {
    key: "owner",
    header: "Owner",
    render: (row) => (
      <div className="flex flex-col gap-1">
        <span>{row.owner?.name ?? "—"}</span>
        <span className="text-muted-foreground text-xs">
          {row.owner?.email}
        </span>
      </div>
    ),
  },
];
