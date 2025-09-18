import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantWarehousesPageProps = {
  params: { tenantId: string };
};

export default function TenantWarehousesPage({
  params,
}: TenantWarehousesPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/warehouses?create=new`,
          label: "Add warehouse",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Warehouses" },
        ]}
        description="Warehousing sites, capacity, and compliance status for this tenant."
        title="Warehouses"
      />

      <PlaceholderSection
        description="Warehouse inventory, throughput, and audit readiness will surface here."
        title="Tenant warehouses"
      />
    </div>
  );
}
