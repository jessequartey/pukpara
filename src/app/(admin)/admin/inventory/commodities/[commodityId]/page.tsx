import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type CommodityDetailPageProps = {
  params: Promise<{ commodityId: string }>;
};

export default async function CommodityDetailPage({
  params,
}: CommodityDetailPageProps) {
  const { commodityId } = await params;
  const basePath = "/admin/inventory";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/commodities`,
          icon: ArrowLeft,
          label: "Back to commodities",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: `${basePath}/commodities` },
          { label: commodityId },
        ]}
        description="Commodity attributes, pricing templates, and compliance data."
        title={`Commodity: ${commodityId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Quality grades, measurement units, and packaging standards will appear here."
          title="Specifications"
        />
        <PlaceholderSection
          description="Pricing benchmarks, seasonal trends, and regional availability will surface in this panel."
          title="Pricing"
        />
      </div>
    </div>
  );
}
