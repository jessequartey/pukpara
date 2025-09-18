import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminFarmersPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: "/admin/farmers?create=new", label: "Add farmer" }}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Farmers" }]}
        description="Cross-organization farmer explorer with rich filters and analytics."
        title="Farmers"
      />

      <PlaceholderSection
        description="Search across farmers, view associated organizations, and inspect activity."
        title="Global farmers"
      />
    </div>
  );
}
