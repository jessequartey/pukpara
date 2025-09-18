import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationMembersPageProps = {
  params: { organizationId: string };
};

export default function OrganizationMembersPage({
  params,
}: OrganizationMembersPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/members?invite=new`,
          label: "Invite member",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Members" },
        ]}
        description="Manage organization users, roles, and invitations."
        title="Members"
      />

      <PlaceholderSection
        description="Member roster with role assignments, MFA status, and last activity will be displayed here."
        title="Organization members"
      />
    </div>
  );
}
