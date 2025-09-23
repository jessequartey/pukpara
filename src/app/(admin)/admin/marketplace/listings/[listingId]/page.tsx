import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default async function AdminListingDetailPage({
	params,
}: {
	params: Promise<{ listingId: string }>;
}) {
	const { listingId } = await params;
	const decodedListingId = decodeURIComponent(listingId);
	const basePath = "/admin/marketplace";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `${basePath}/listings`,
					icon: ArrowLeft,
					label: "Back to listings",
				}}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Marketplace", href: `${basePath}/listings` },
					{ label: decodedListingId },
				]}
				description="Listing performance, buyer interest, and fulfillment timeline."
				title={`Listing: ${decodedListingId}`}
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<PlaceholderSection
					description="Listing details, pricing tiers, and supply status will render here."
					title="Listing details"
				/>
				<PlaceholderSection
					description="Buyer pipeline, negotiations, and delivery checkpoints will populate this panel."
					title="Engagement"
				/>
			</div>
		</div>
	);
}
