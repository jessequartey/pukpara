import { PageTitle } from "@/components/ui/page-title";
import { FarmsListPlaceholder } from "@/features/farms/components/farms-list-placeholder";

type FarmerFarmsPageProps = {
  params: { orgId: string; farmerId: string };
};

export default function FarmerFarmsPage({ params }: FarmerFarmsPageProps) {
  const basePath = `/app/${params.orgId}`;
  const farmersPath = `${basePath}/farmers`;
  const farmerId = decodeURIComponent(params.farmerId);
  const farmsPath = `${farmersPath}/${params.farmerId}/farms`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${farmsPath}/create`, label: "Register farm" }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Farmers", href: farmersPath },
          { label: farmerId, href: `${farmersPath}/${params.farmerId}` },
          { label: "Farms" },
        ]}
        description="Manage the farmer's farm records, production history, and geo data."
        title="Farms"
      />

      <FarmsListPlaceholder />
    </div>
  );
}
