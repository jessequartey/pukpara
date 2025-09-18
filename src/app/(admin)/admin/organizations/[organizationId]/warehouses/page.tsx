import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationWarehousesPageProps = {
  params: { organizationId: string };
};

export default function OrganizationWarehousesPage({
  params,
}: OrganizationWarehousesPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/warehouses?create=new`,
          label: "Add warehouse",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Warehouses" },
        ]}
        description="Warehousing sites, capacity, and compliance status for this organization."
        title="Warehouses"
      />

      <PlaceholderSection
        description="Warehouse inventory, throughput, and audit readiness will surface here."
        title="Organization warehouses"
      />
    </div>
  );
}
