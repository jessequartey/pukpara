import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantMarketplacePageProps = {
  params: { tenantId: string };
};

export default function TenantMarketplacePage({
  params,
}: TenantMarketplacePageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/marketplace?create=new`,
          label: "Add listing",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Marketplace" },
        ]}
        description="Tenant-specific marketplace listings and performance."
        title="Marketplace"
      />

      <PlaceholderSection
        description="Catalog listings, conversions, and pricing analytics will populate this view."
        title="Marketplace analytics"
      />
    </div>
  );
}
