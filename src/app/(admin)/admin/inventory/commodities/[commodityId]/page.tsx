import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default async function CommodityDetailPage({
	params,
}: {
	params: Promise<{ commodityId: string }>;
}) {
	const { commodityId } = await params;
	const decodedCommodityId = decodeURIComponent(commodityId);
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
					{ label: decodedCommodityId },
				]}
				description="Commodity attributes, pricing templates, and compliance data."
				title={`Commodity: ${decodedCommodityId}`}
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
