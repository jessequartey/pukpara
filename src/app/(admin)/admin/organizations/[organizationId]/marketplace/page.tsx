import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationMarketplacePageProps = {
  params: { organizationId: string };
};

export default function OrganizationMarketplacePage({
  params,
}: OrganizationMarketplacePageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/marketplace?create=new`,
          label: "Add listing",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Marketplace" },
        ]}
        description="Organization-specific marketplace listings and performance."
        title="Marketplace"
      />

      <PlaceholderSection
        description="Catalog listings, conversions, and pricing analytics will populate this view."
        title="Marketplace analytics"
      />
    </div>
  );
}
