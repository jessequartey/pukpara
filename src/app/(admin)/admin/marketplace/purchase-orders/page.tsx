import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

export default function AdminPurchaseOrdersPage() {
  const basePath = "/admin/marketplace";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/purchase-orders?create=new`,
          label: "Create PO",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketplace", href: `${basePath}/listings` },
          { label: "Purchase orders" },
        ]}
        description="All marketplace purchase orders and fulfillment status."
        title="Purchase orders"
      />

      <PlaceholderSection
        description="Order progression, logistics tracking, and settlement state will be surfaced here."
        title="Purchase orders"
      />
    </div>
  );
}
