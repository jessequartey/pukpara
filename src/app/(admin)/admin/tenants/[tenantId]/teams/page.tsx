import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantTeamsPageProps = {
  params: { tenantId: string };
};

export default function TenantTeamsPage({ params }: TenantTeamsPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/teams?create=new`, label: "Create team" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Teams" },
        ]}
        description="Tenants can organize members into teams aligned to business units or regions."
        title="Teams"
      />

      <PlaceholderSection
        description="Team roster, permissions, and productivity metrics will be surfaced here."
        title="Tenant teams"
      />
    </div>
  );
}
