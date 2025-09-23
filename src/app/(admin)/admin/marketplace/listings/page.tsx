import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminMarketplaceListingsPage() {
	const basePath = "/admin/marketplace";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `${basePath}/listings?create=new`,
					label: "Create listing",
				}}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Marketplace", href: `${basePath}/listings` },
					{ label: "Listings" },
				]}
				description="Catalogue of marketplace listings across all organizations."
				title="Listings"
			/>

			<PlaceholderSection
				description="Listing status, pricing, and fulfillment signals will populate this view."
				title="Marketplace listings"
			/>
		</div>
	);
}
