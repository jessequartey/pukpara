import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type AdminPurchaseOrderDetailPageProps = {
  params: { poId: string };
};

export default function AdminPurchaseOrderDetailPage({
  params,
}: AdminPurchaseOrderDetailPageProps) {
  const poId = decodeURIComponent(params.poId);
  const basePath = "/admin/marketplace";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/purchase-orders`,
          icon: ArrowLeft,
          label: "Back to purchase orders",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Marketplace", href: `${basePath}/listings` },
          { label: "Purchase orders", href: `${basePath}/purchase-orders` },
          { label: poId },
        ]}
        description="Purchase order fulfillment, logistics, and invoicing trail."
        title={`Purchase order: ${poId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="PO line items, pricing, and supplier assignments will render here."
          title="Order details"
        />
        <PlaceholderSection
          description="Delivery milestones, quality checks, and settlements will populate this panel."
          title="Fulfillment"
        />
      </div>
    </div>
  );
}
