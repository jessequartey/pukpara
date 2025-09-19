"use client";

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

  const breadcrumbs = [
    { label: organization.name, href: `/admin/organizations/${orgId}` },
  ];

  return (
    <OrganizationPageTitle
      breadcrumbs={breadcrumbs}
      description="Comprehensive view of organization details, members, and activities"
      title={organization.name}
    >
      <OrganizationDetailsContent orgId={orgId} />
    </OrganizationPageTitle>
  );
}

export default OrganizationDetailsPage;
