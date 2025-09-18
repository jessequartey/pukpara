import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminInventoryWarehousesPage() {
  const basePath = "/admin/inventory";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/warehouses?create=new`,
          label: "Add warehouse",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: `${basePath}/commodities` },
          { label: "Warehouses" },
        ]}
        description="Platform-wide view of storage facilities and capacity."
        title="Warehouses"
      />

      <PlaceholderSection
        description="Facility capacity, utilization, and compliance monitoring will appear here."
        title="Warehouse inventory"
      />
    </div>
  );
}
