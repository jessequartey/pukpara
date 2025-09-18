import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminSettingsRegionsPage() {
  const basePath = "/admin/settings/reference";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/regions?create=new`, label: "Add region" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Reference", href: basePath },
          { label: "Regions" },
        ]}
        description="Reference data for regions and districts used across the platform."
        title="Regions"
      />

      <PlaceholderSection
        description="Region definitions, codes, and geographic metadata will be curated here."
        title="Region directory"
      />
    </div>
  );
}
