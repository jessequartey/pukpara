"use client";

// import { ComplianceKycCard } from "./organization-details/compliance-kyc-card";
import { ContactAddressCard } from "./organization-details/contact-address-card";
import { DeleteOrganizationCard } from "./organization-details/delete-organization-card";
// import { InventoryCard } from "./organization-details/inventory-card";
// import { KpisFinanceCard } from "./organization-details/kpis-finance-card";
// import { MarketplaceActivityCard } from "./organization-details/marketplace-activity-card";
import { OrganizationOverviewCard } from "./organization-details/organization-overview-card";
import { PrimaryContactCard } from "./organization-details/primary-contact-card";
// import { RecentActivityCard } from "./organization-details/recent-activity-card";
import { SubscriptionLicenseCard } from "./organization-details/subscription-license-card";

type OrganizationDetailsContentProps = {
  orgId: string;
};

export function OrganizationDetailsContent({
  orgId,
}: OrganizationDetailsContentProps) {
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

  const handleDelete = () => {
    // TODO: Implement actual delete logic
    // This would typically call an API to delete the organization
  };

  return (
    <div className="space-y-6">
      <OrganizationOverviewCard />
      <ContactAddressCard />
      <SubscriptionLicenseCard />
      <PrimaryContactCard />
      <DeleteOrganizationCard
        organizationName={organization.name}
        onDelete={handleDelete}
      />

      {/* Hidden right column cards for future use */}
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrganizationOverviewCard />
          <ContactAddressCard />
          <SubscriptionLicenseCard />
          <PrimaryContactCard />
        </div>
        <div className="space-y-6">
          <KpisFinanceCard />
          <InventoryCard />
          <MarketplaceActivityCard />
          <ComplianceKycCard />
          <RecentActivityCard />
        </div>
      </div> */}
    </div>
  );
}
