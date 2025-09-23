import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminSettingsDistrictsPage() {
	const basePath = "/admin/settings/reference";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `${basePath}/districts?create=new`,
					label: "Add district",
				}}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Settings", href: "/admin/settings" },
					{ label: "Reference", href: basePath },
					{ label: "Districts" },
				]}
				description="Districts and localities referenced by organizations and farms."
				title="Districts"
			/>

			<PlaceholderSection
				description="District codes, parent regions, and geospatial identifiers will populate here."
				title="District directory"
			/>
		</div>
	);
}
