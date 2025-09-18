import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantFarmersPageProps = {
  params: { tenantId: string };
};

export default function TenantFarmersPage({ params }: TenantFarmersPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/farmers?create=new`, label: "Add farmer" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Farmers" },
        ]}
        description="Explore all farmers under this tenant organization."
        title="Farmers"
      />

      <PlaceholderSection
        description="Enrollment status, farm counts, and verification timeline will render here."
        title="Tenant farmers"
      />
    </div>
  );
}
