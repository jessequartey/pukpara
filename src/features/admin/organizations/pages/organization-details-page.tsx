import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ORGANIZATION_KYC_STATUS,
  ORGANIZATION_STATUS,
  ORGANIZATION_SUBSCRIPTION_TYPE,
} from "@/config/constants/auth";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";
import { api } from "@/trpc/server";

const statusStyles: Record<
  string,
  { label: string; variant: "default" | "secondary" }
> = {
  [ORGANIZATION_STATUS.PENDING]: { label: "Pending", variant: "secondary" },
  [ORGANIZATION_STATUS.ACTIVE]: { label: "Active", variant: "default" },
  [ORGANIZATION_STATUS.SUSPENDED]: { label: "Suspended", variant: "secondary" },
};

const kycStyles: Record<string, string> = {
  [ORGANIZATION_KYC_STATUS.PENDING]: "Pending",
  [ORGANIZATION_KYC_STATUS.VERIFIED]: "Verified",
  [ORGANIZATION_KYC_STATUS.REJECTED]: "Rejected",
};

const formatDate = (value: Date | string | null) => {
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

export async function OrganizationDetailsPage({
  organizationId,
}: {
  organizationId: string;
}) {
  const detail = await api.organizations.detail
    .query({ organizationId })
    .catch((error) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "NOT_FOUND"
      ) {
        notFound();
      }
      throw error;
    });

  const { organization, leadership, stats } = detail;
  const status = statusStyles[organization.status ?? ""] ?? {
    label: organization.status ?? "Unknown",
    variant: "secondary" as const,
  };

  const subscriptionLabel = (() => {
    switch (organization.subscriptionType) {
      case ORGANIZATION_SUBSCRIPTION_TYPE.PAID:
        return "Paid";
      case ORGANIZATION_SUBSCRIPTION_TYPE.ENTERPRISE:
        return "Enterprise";
      default:
        return "Freemium";
    }
  })();

  return (
    <OrganizationPageTitle
      action={{
        icon: ArrowLeft,
        href: "/admin/organizations",
        label: "Back to organizations",
      }}
      breadcrumbs={[{ label: organization.name }]}
      description="Organization-level metrics, licensing, and operational health."
      title={organization.name}
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Core identifiers and current lifecycle state for this
              organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem heading="Status">
                <Badge variant={status.variant}>{status.label}</Badge>
              </DetailItem>
              <DetailItem heading="KYC">
                <Badge variant="outline">
                  {kycStyles[organization.kycStatus ?? ""] ?? "Unknown"}
                </Badge>
              </DetailItem>
              <DetailItem heading="Classification">
                {organization.organizationType?.replace(/_/g, " ") ?? "—"}
              </DetailItem>
              <DetailItem heading="Created">
                {formatDate(organization.createdAt)}
              </DetailItem>
              <DetailItem heading="Contact email">
                {organization.contactEmail ?? "—"}
              </DetailItem>
              <DetailItem heading="Contact phone">
                {organization.contactPhone ?? "—"}
              </DetailItem>
              <DetailItem heading="Subscription">
                {subscriptionLabel}
              </DetailItem>
              <DetailItem heading="Plan renews">
                {formatDate(organization.planRenewsAt)}
              </DetailItem>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snapshot</CardTitle>
            <CardDescription>Membership and limits overview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Members" value={stats.memberCount.toString()} />
            <MetricRow
              label="Max users"
              value={
                organization.maxUsers ? organization.maxUsers.toString() : "—"
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
          <CardDescription>
            Owners and administrators responsible for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadership.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No administrator records found.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {leadership.map((leader) => {
                const roleLabel = leader.role
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ");
                return (
                  <li
                    className="flex items-center justify-between py-3"
                    key={leader.id}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{leader.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {leader.email}
                      </span>
                    </div>
                    <Badge variant="outline">{roleLabel}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </OrganizationPageTitle>
  );
}

type DetailItemProps = {
  heading: string;
  children: React.ReactNode;
};

const DetailItem = ({ heading, children }: DetailItemProps) => (
  <div className="flex flex-col gap-1">
    <dt className="text-muted-foreground text-xs uppercase tracking-wide">
      {heading}
    </dt>
    <dd className="text-foreground text-sm">{children}</dd>
  </div>
);

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="font-medium tabular-nums">{value}</span>
  </div>
);

export default OrganizationDetailsPage;
