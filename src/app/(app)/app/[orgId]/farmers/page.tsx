import { PageTitle } from "@/components/ui/page-title";
import { FarmersDirectoryPlaceholder } from "@/features/farmers/components/farmers-directory-placeholder";

type OrgFarmersPageProps = {
  params: { orgId: string };
};

export default function OrgFarmersPage({ params }: OrgFarmersPageProps) {
  const basePath = `/app/${params.orgId}`;
  const listPath = `${basePath}/farmers`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${listPath}/create`, label: "Add farmer" }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Farmers" },
        ]}
        description="View and manage farmer enrollment, documents, and farm assets."
        title="Farmers"
      />

      <FarmersDirectoryPlaceholder />
    </div>
  );
}
