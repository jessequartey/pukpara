import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationSettingsPageProps = {
  params: { organizationId: string };
};

export default function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/settings?edit=true`,
          label: "Edit settings",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Settings" },
        ]}
        description="Control organization license, feature access, and compliance requirements."
        title="Settings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Organization profile, billing contacts, and support escalation settings."
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
