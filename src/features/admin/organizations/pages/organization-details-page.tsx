"use client";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OrganizationDetailsContent } from "@/features/admin/organizations/components/organization-details-content";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";

type OrganizationDetailsPageProps = {
  orgId: string;
};

export function OrganizationDetailsPage({
  orgId,
}: OrganizationDetailsPageProps) {
  // Mock organization data - replace with actual API call
  const organization = {
    id: orgId,
    name: "Green Valley Cooperative",
    slug: "green-valley-coop",
    status: "active" as const,
    organizationType: "cooperative" as const,
    subscriptionType: "premium" as const,
    licenseStatus: "issued" as const,
  };

  const customTitle = (
    <div className="space-y-2">
      <h2 className="font-bold text-2xl text-foreground tracking-tight">
        {organization.name}
      </h2>
      <span className="text-muted-foreground text-sm">
        ({organization.slug})
      </span>
    </div>
  );

  const badgeDescription = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={organization.status === "active" ? "default" : "secondary"}>
        {organization.status}
      </Badge>
      <Badge variant="outline">{organization.organizationType}</Badge>
      <Badge variant="default">{organization.subscriptionType}</Badge>
      <Badge variant={organization.licenseStatus === "issued" ? "default" : "destructive"}>
        {organization.licenseStatus}
      </Badge>
    </div>
  );

  return (
    <OrganizationPageTitle
      action={{
        label: "Back to Organizations",
        href: "/admin/organizations",
        icon: ArrowLeft,
      }}
      description={badgeDescription}
      title={organization.name}
      titleContent={customTitle}
    >
      <OrganizationDetailsContent orgId={orgId} />
    </OrganizationPageTitle>
  );
}

export default OrganizationDetailsPage;
