import { OrganizationDetailsContent } from "@/features/admin/organizations/components/organization-details-content";
import { OrganizationDetailsLayout } from "@/features/admin/organizations/components/organization-details-layout";
import { OrganizationDetailsShell } from "@/features/admin/organizations/pages/organization-details-shell";

type OrganizationDetailsPageProps = {
  organizationId: string;
};

export async function OrganizationDetailsPage({
  organizationId,
}: OrganizationDetailsPageProps) {
  return (
    <OrganizationDetailsShell organizationId={organizationId}>
      {(detail) => {
        const basePath = `/admin/organizations/${organizationId}`;
        const currentPath = basePath;

        return (
          <OrganizationDetailsLayout
            organization={detail.organization}
            basePath={basePath}
            currentPath={currentPath}
          >
            <OrganizationDetailsContent detail={detail} />
          </OrganizationDetailsLayout>
        );
      }}
    </OrganizationDetailsShell>
  );
}

export default OrganizationDetailsPage;
