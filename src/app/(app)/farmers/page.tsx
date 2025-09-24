import { PageTitle } from "@/components/ui/page-title";
import { FarmersDirectoryCard } from "@/features/organization/farmers/components/farmers-directory-card";

export default async function OrgFarmersPage() {
	return (
		<div className="space-y-8">
			<PageTitle
				action={{ href: "/farmers/create", label: "Add farmer" }}
				breadcrumbs={[
					{ label: "Organization", href: "/" },
					{ label: "Farmers" },
				]}
				description="View and manage farmer enrollment, documents, and farm assets."
				title="Farmers"
			/>

			<FarmersDirectoryCard />
		</div>
	);
}
