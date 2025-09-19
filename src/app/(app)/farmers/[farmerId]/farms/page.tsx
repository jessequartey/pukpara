import { PageTitle } from "@/components/ui/page-title";
import { FarmsListPlaceholder } from "@/features/farms/components/farms-list-placeholder";

export default async function FarmerFarmsPage({
  params,
}: {
  params: Promise<{ orgId: string; farmerId: string }>;
}) {
  const { orgId, farmerId } = await params;
  const basePath = `/app/${orgId}`;
  const farmersPath = `${basePath}/farmers`;
  const decodedFarmerId = decodeURIComponent(farmerId);
  const farmsPath = `${farmersPath}/${farmerId}/farms`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${farmsPath}/create`, label: "Register farm" }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Farmers", href: farmersPath },
          { label: decodedFarmerId, href: `${farmersPath}/${farmerId}` },
          { label: "Farms" },
        ]}
        description="Manage the farmer's farm records, production history, and geo data."
        title="Farms"
      />

      <FarmsListPlaceholder />
    </div>
  );
}
