import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default async function AdminFarmerDetailPage({
  params,
}: {
  params: { farmerId: string };
}) {
  const farmerId = decodeURIComponent(params.farmerId);

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: "/admin/farmers",
          icon: ArrowLeft,
          label: "Back to farmers",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Farmers", href: "/admin/farmers" },
          { label: farmerId },
        ]}
        description="Cross-organization farmer profile with membership and risk posture."
        title={`Farmer: ${farmerId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Tenant memberships, regions, and compliance notes will display here."
          title="Membership"
        />
        <PlaceholderSection
          description="Financial exposure, support cases, and escalations will populate this view."
          title="Risk overview"
        />
      </div>
    </div>
  );
}
