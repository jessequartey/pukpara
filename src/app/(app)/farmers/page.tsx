import { PageTitle } from "@/components/ui/page-title";
import { FarmersDirectoryPlaceholder } from "@/features/farmers/components/farmers-directory-placeholder";

type OrgFarmersPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgFarmersPage({ params }: OrgFarmersPageProps) {
  const { orgId } = await params;
  const basePath = `/app/${orgId}`;
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
