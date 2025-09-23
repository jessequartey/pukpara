import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminVarietiesPage() {
	const basePath = "/admin/inventory";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `${basePath}/varieties?create=new`,
					label: "Add variety",
				}}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Inventory", href: `${basePath}/commodities` },
					{ label: "Varieties" },
				]}
				description="Catalog of commodity varieties with agronomic metadata."
				title="Varieties"
			/>

			<PlaceholderSection
				description="Variety-level traits, seasons, and recommended inputs will be managed here."
				title="Variety catalog"
			/>
		</div>
	);
}
