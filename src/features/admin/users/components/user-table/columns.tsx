import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { USER_KYC_STATUS, USER_STATUS } from "@/config/constants/auth";

export type UserTableRow = {
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
  kycStatus: string | null;
  status: string | null;
  approvedAt: Date | string | null;
  lastLogin: Date | string | null;
  districtName: string | null;
  regionName: string | null;
  organizationCount: number;
  organizationNames: string[];
};

export type UserColumnKey =
  | "name"
  | "contact"
  | "location"
  | "status"
  // | "kycStatus"
  | "organizations"
  // | "lastLogin"
  | "createdAt";

export type UserColumn = {
  key: UserColumnKey;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  widthClassName?: string;
  render?: (row: UserTableRow) => ReactNode;
};

const statusLabels: Record<string, string> = {
  [USER_STATUS.PENDING]: "Pending",
  [USER_STATUS.APPROVED]: "Active",
  [USER_STATUS.SUSPENDED]: "Suspended",
  [USER_STATUS.REJECTED]: "Rejected",
};

const _kycLabels: Record<string, string> = {
  [USER_KYC_STATUS.PENDING]: "Pending",
  [USER_KYC_STATUS.VERIFIED]: "Verified",
  [USER_KYC_STATUS.REJECTED]: "Rejected",
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

export const userColumns: UserColumn[] = [
  {
    key: "name",
    header: "User",
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
                .toUpperCase() || "U"}
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
  // {
  //   key: "kycStatus",
  //   header: "KYC",
  //   sortable: true,
  //   render: (row) => {
  //     const kycStatus = row.kycStatus ?? "";
  //     const label = kycLabels[kycStatus] ?? toTitleCase(kycStatus);
  //     const variant =
  //       kycStatus === USER_KYC_STATUS.VERIFIED
  //         ? "default"
  //         : kycStatus === USER_KYC_STATUS.REJECTED
  //           ? "destructive"
  //           : "outline";

  //     return <Badge variant={variant}>{label}</Badge>;
  //   },
  // },
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
