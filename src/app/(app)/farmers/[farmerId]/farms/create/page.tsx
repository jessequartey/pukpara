import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function CreateFarmPage({
  params,
}: {
  params: Promise<{ orgId: string; farmerId: string }>;
}) {
  const { orgId, farmerId } = await params;
  const basePath = `/app/${orgId}`;
  const farmersPath = `${basePath}/farmers`;
  const farmsPath = `${farmersPath}/${farmerId}/farms`;
  const decodedFarmerId = decodeURIComponent(farmerId);

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: farmsPath,
          icon: ArrowLeft,
          label: "Back to farms",
        }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Farmers", href: farmersPath },
          { label: decodedFarmerId, href: `${farmersPath}/${farmerId}` },
          { label: "Farms", href: farmsPath },
          { label: "Create" },
        ]}
        description="Capture farm boundaries, crops, and monitoring preferences."
        title="Register farm"
      />

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Map drawing tools, coordinates, and agronomic templates will guide
          farm registration here.
        </p>
      </section>
    </div>
  );
}
