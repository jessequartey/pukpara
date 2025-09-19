import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function CreateFarmPage({
  params,
}: {
  params: { orgId: string; farmerId: string };
}) {
  const basePath = `/app/${params.orgId}`;
  const farmersPath = `${basePath}/farmers`;
  const farmsPath = `${farmersPath}/${params.farmerId}/farms`;
  const farmerId = decodeURIComponent(params.farmerId);

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
          { label: farmerId, href: `${farmersPath}/${params.farmerId}` },
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
