import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantMembersPageProps = {
  params: { tenantId: string };
};

export default function TenantMembersPage({ params }: TenantMembersPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/members?invite=new`,
          label: "Invite member",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Members" },
        ]}
        description="Manage tenant users, roles, and invitations."
        title="Members"
      />

      <PlaceholderSection
        description="Member roster with role assignments, MFA status, and last activity will be displayed here."
        title="Tenant members"
      />
    </div>
  );
}
