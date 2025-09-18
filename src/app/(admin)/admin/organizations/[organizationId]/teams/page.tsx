import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationTeamsPageProps = {
  params: { organizationId: string };
};

export default function OrganizationTeamsPage({
  params,
}: OrganizationTeamsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/teams?create=new`, label: "Create team" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Teams" },
        ]}
        description="Organizations can organize members into teams aligned to business units or regions."
        title="Teams"
      />

      <PlaceholderSection
        description="Team roster, permissions, and productivity metrics will be surfaced here."
        title="Organization teams"
      />
    </div>
  );
}
