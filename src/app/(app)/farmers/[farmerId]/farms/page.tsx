import { PageTitle } from "@/components/ui/page-title";
import { FarmsListPlaceholder } from "@/features/farms/components/farms-list-placeholder";

export default async function FarmerFarmsPage({
	params,
}: {
	params: Promise<{ farmerId: string }>;
}) {
	const { farmerId } = await params;
	const decodedFarmerId = decodeURIComponent(farmerId);

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `/farmers/${farmerId}/farms/create`,
					label: "Register farm",
				}}
				breadcrumbs={[
					{ label: "Organization", href: "/" },
					{ label: "Farmers", href: "/farmers" },
					{ label: decodedFarmerId, href: `/farmers/${farmerId}` },
					{ label: "Farms" },
				]}
				description="Manage the farmer's farm records, production history, and geo data."
				title="Farms"
			/>

			<FarmsListPlaceholder />
		</div>
	);
}
