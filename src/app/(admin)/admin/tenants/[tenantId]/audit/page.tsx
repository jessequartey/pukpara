import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantAuditPageProps = {
  params: { tenantId: string };
};

export default function TenantAuditPage({ params }: TenantAuditPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/audit?export=csv`, label: "Export log" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Audit" },
        ]}
        description="Trace user actions, configuration changes, and approvals for this tenant."
        title="Audit log"
      />

      <PlaceholderSection
        description="Chronological audit entries with filters and export options will render here."
        title="Audit trail"
      />
    </div>
  );
}
