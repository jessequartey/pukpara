import { Building2, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationDetailsPageProps = {
  organizationId: string;
};

const formatDateTime = (value: Date | string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const isAggregator = (organizationType: string | null) => {
  if (!organizationType) {
    return false;
  }

  return organizationType.toUpperCase() === "AGGREGATOR";
};

const supportsFarmers = (organizationType: string | null) => {
  if (!organizationType) {
    return false;
  }

  const value = organizationType.toUpperCase();
  return value === "FARMER_ORG" || value === "AGGREGATOR";
};

const supportsWarehouses = (organizationType: string | null) => {
  if (!organizationType) {
    return false;
  }

  const value = organizationType.toUpperCase();
  return value === "SUPPLIER" || value === "AGGREGATOR";
};

const getLimitBadges = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object") {
    return [] as { key: string; value: string }[];
  }

  const { limits } = metadata as { limits?: Record<string, unknown> };

  if (!limits || typeof limits !== "object") {
    return [] as { key: string; value: string }[];
  }

  const entries: { key: string; value: string }[] = [];

  for (const [key, value] of Object.entries(limits)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" || typeof value === "number") {
      entries.push({ key, value: String(value) });
      continue;
    }

    entries.push({ key, value: JSON.stringify(value) });
  }

  return entries;
};

export async function OrganizationDetailsPage({
  organizationId,
}: OrganizationDetailsPageProps) {
  const currentPath = `/admin/organizations/${encodeURIComponent(organizationId)}`;

  return (
    <OrganizationDetailsShell
      currentPath={currentPath}
      organizationId={organizationId}
    >
      {(detail) => {
        const { organization, stats, leadership } = detail;
        const basePath = `/admin/organizations/${encodeURIComponent(
          organization.id
        )}`;

        const metrics: {
          key: string;
          label: string;
          value: string;
          hint?: string;
          visible: boolean;
        }[] = [
          {
            key: "members",
            label: "Members",
            value: stats.memberCount.toLocaleString(),
            hint: organization.maxUsers
              ? `of ${organization.maxUsers.toLocaleString()}`
              : undefined,
            visible: true,
          },
          {
            key: "teams",
            label: "Teams",
            value: "—",
            hint: "Awaiting sync",
            visible: true,
          },
          {
            key: "farmers",
            label: "Farmers",
            value: "—",
            hint: "Sync from farmer registry",
            visible: supportsFarmers(organization.organizationType),
          },
          {
            key: "warehouses",
            label: "Warehouses",
            value: "—",
            hint: "Sync from inventory module",
            visible: supportsWarehouses(organization.organizationType),
          },
          {
            key: "activeLoans",
            label: "Active loans (GHS)",
            value: "—",
            hint: "Total exposure",
            visible: true,
          },
          {
            key: "savings",
            label: "Savings balance (GHS)",
            value: "—",
            hint: "Aggregate savings accounts",
            visible: true,
          },
          {
            key: "openPos",
            label: "Open POs",
            value: "—",
            hint: "Count · value",
            visible: isAggregator(organization.organizationType),
          },
        ];

        const limitBadges = getLimitBadges(organization.metadata);

        return (
          <div className="space-y-8">
            <section aria-labelledby="organization-kpis">
              <h3 className="sr-only" id="organization-kpis">
                Organization KPIs
              </h3>
              <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {metrics
                  .filter((metric) => metric.visible)
                  .map((metric) => (
                    <Card key={metric.key}>
                      <CardHeader className="pb-2">
                        <CardDescription>{metric.label}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-1">
                        <span className="font-semibold text-3xl tracking-tight">
                          {metric.value}
                        </span>
                        {metric.hint ? (
                          <span className="text-muted-foreground text-xs">
                            {metric.hint}
                          </span>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>

            <section aria-labelledby="profile-snapshot">
              <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle id="profile-snapshot">
                        Profile snapshot
                      </CardTitle>
                      <CardDescription>
                        Contact, addressing, and identity metadata sourced from
                        onboarding.
                      </CardDescription>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`${basePath}/settings`}>Edit details</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-4 md:grid-cols-2">
                      <InfoRow icon={<Mail aria-hidden className="size-4" />}>
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Contact email
                        </dt>
                        <dd className="text-sm">
                          {organization.contactEmail ?? "—"}
                        </dd>
                      </InfoRow>
                      <InfoRow icon={<Phone aria-hidden className="size-4" />}>
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Contact phone
                        </dt>
                        <dd className="text-sm">
                          {organization.contactPhone ?? "—"}
                        </dd>
                      </InfoRow>
                      <InfoRow
                        icon={<Building2 aria-hidden className="size-4" />}
                      >
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Address
                        </dt>
                        <dd className="text-sm">
                          {organization.address ?? "—"}
                        </dd>
                      </InfoRow>
                      <InfoRow icon={<MapPin aria-hidden className="size-4" />}>
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          Region / district
                        </dt>
                        <dd className="text-sm">
                          {organization.regionId || organization.districtId
                            ? `${organization.regionId ?? "—"} / ${organization.districtId ?? "—"}`
                            : "—"}
                        </dd>
                      </InfoRow>
                      <InfoRow
                        icon={<ShieldAlert aria-hidden className="size-4" />}
                      >
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          USSD ID
                        </dt>
                        <dd className="text-sm">—</dd>
                      </InfoRow>
                      <InfoRow
                        icon={<ShieldAlert aria-hidden className="size-4" />}
                      >
                        <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                          SMS ID
                        </dt>
                        <dd className="text-sm">—</dd>
                      </InfoRow>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status timeline</CardTitle>
                    <CardDescription>
                      Key lifecycle checkpoints for the organization.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative space-y-4 border-l pl-6">
                      <TimelineItem
                        actor="System"
                        label="Created"
                        note="Organization record provisioned"
                        timestamp={formatDateTime(organization.createdAt)}
                      />
                      <TimelineItem
                        actor="—"
                        label="Approval pending"
                        note="Awaiting reviewer decision"
                        timestamp="—"
                      />
                      <TimelineItem
                        actor="—"
                        label="Activation"
                        note="Will capture suspension or reactivation events"
                        timestamp="—"
                      />
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section
              aria-labelledby="activity-limits"
              className="grid gap-6 xl:grid-cols-[2fr,1fr]"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="activity-limits">Recent activity</CardTitle>
                  <CardDescription>
                    The ten most recent audited actions across the organization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="text-center text-muted-foreground text-sm"
                          colSpan={4}
                        >
                          Audit log streaming will populate this section once
                          available.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limits & flags</CardTitle>
                  <CardDescription>
                    Feature toggles and quantitative caps applied to this
                    organization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {limitBadges.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No explicit limits configured. Configure limits from the
                      Settings tab to enforce group, warehouse, or financial
                      thresholds.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {limitBadges.map((limit) => (
                        <Badge key={limit.key} variant="outline">
                          {limit.key}: {limit.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="leadership" className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-lg" id="leadership">
                    Leadership
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Owners and admins tasked with managing the organization.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`${basePath}/members?invite=new`}>
                    Invite leader
                  </Link>
                </Button>
              </div>
              <div className="divide-y rounded-lg border">
                {leadership.length === 0 ? (
                  <p className="p-4 text-muted-foreground text-sm">
                    Leadership assignments will appear once members are elevated
                    to admin or owner roles.
                  </p>
                ) : (
                  leadership.map((leader) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 p-4"
                      key={leader.id}
                    >
                      <div>
                        <p className="font-medium">{leader.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {leader.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {leader.role
                          .split("_")
                          .map(
                            (segment) =>
                              `${segment.charAt(0)}${segment.slice(1).toLowerCase()}`
                          )
                          .join(" ")}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        );
      }}
    </OrganizationDetailsShell>
  );
}

const InfoRow = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-transparent p-2 hover:border-border">
    <span className="mt-1 size-6 shrink-0 rounded-full border border-border/60 border-dashed bg-muted/40 p-1 text-muted-foreground">
      {icon}
    </span>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

const TimelineItem = ({
  label,
  actor,
  timestamp,
  note,
}: {
  label: string;
  actor: string;
  timestamp: string;
  note: string;
}) => (
  <li className="relative grid gap-1">
    <span
      aria-hidden
      className="-left-[1.49rem] absolute mt-0.5 flex size-3 items-center justify-center rounded-full border border-primary bg-background"
    />
    <p className="font-medium text-sm">{label}</p>
    <p className="text-muted-foreground text-xs">
      {actor} · {timestamp}
    </p>
    <p className="text-muted-foreground text-xs">{note}</p>
  </li>
);

export default OrganizationDetailsPage;
