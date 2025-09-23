import { ArrowLeft, Map as MapIcon, Sprout } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function FarmDetailPage({
	params,
}: {
	params: Promise<{ orgId: string; farmerId: string; farmId: string }>;
}) {
	const { orgId, farmerId, farmId } = await params;
	const basePath = `/app/${orgId}`;
	const farmersPath = `${basePath}/farmers`;
	const farmsPath = `${farmersPath}/${farmerId}/farms`;
	const decodedFarmerId = decodeURIComponent(farmerId);
	const decodedFarmId = decodeURIComponent(farmId);

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: farmsPath,
					icon: ArrowLeft,
					label: "Back to farms",
				}}
				breadcrumbs={[
					{ label: "Organization", href: basePath },
					{ label: "Farmers", href: farmersPath },
					{ label: decodedFarmerId, href: `${farmersPath}/${farmerId}` },
					{ label: "Farms", href: farmsPath },
					{ label: decodedFarmId },
				]}
				description="Farm boundaries, production timelines, and agronomic performance."
				title={`Farm: ${decodedFarmId}`}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<section className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
					<header className="flex items-center gap-3">
						<MapIcon aria-hidden="true" className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-base">Location and acreage</h3>
					</header>
					<p className="mt-3 text-muted-foreground text-sm">
						Interactive mapping, sensor data, and extension visit history will
						showcase farm insights here.
					</p>
				</section>
				<section className="rounded-xl border bg-card p-6 shadow-sm">
					<header className="flex items-center gap-3">
						<Sprout aria-hidden="true" className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-base">Crop portfolio</h3>
					</header>
					<p className="mt-3 text-muted-foreground text-sm">
						Crop diagrams, input plans, and yield tracking will come alive here.
					</p>
				</section>
			</div>
		</div>
	);
}
