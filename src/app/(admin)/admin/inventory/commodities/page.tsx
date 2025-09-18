import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminCommoditiesPage() {
  const basePath = "/admin/inventory";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/commodities?create=new`,
          label: "Add commodity",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: `${basePath}/commodities` },
          { label: "Commodities" },
        ]}
        description="Maintain the global commodity catalog for the marketplace."
        title="Commodities"
      />

      <PlaceholderSection
        description="Commodity definitions, grades, and quality specs will be configured here."
        title="Commodity catalog"
      />
    </div>
  );
}
