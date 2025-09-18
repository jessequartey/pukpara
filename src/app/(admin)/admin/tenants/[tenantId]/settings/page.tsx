import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantSettingsPageProps = {
  params: { tenantId: string };
};

export default function TenantSettingsPage({
  params,
}: TenantSettingsPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/settings?edit=true`,
          label: "Edit settings",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Settings" },
        ]}
        description="Control tenant license, feature access, and compliance requirements."
        title="Settings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Tenant profile, billing contacts, and support escalation settings."
          title="Profile"
        />
        <PlaceholderSection
          description="Feature toggles, usage limits, and workflow configurations."
          title="Feature flags"
        />
      </div>
    </div>
  );
}
