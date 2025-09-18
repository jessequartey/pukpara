import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationAuditPageProps = {
  params: { organizationId: string };
};

export default function OrganizationAuditPage({
  params,
}: OrganizationAuditPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/audit?export=csv`, label: "Export log" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Audit" },
        ]}
        description="Trace user actions, configuration changes, and approvals for this organization."
        title="Audit log"
      />

      <PlaceholderSection
        description="Chronological audit entries with filters and export options will render here."
        title="Audit trail"
      />
    </div>
  );
}
