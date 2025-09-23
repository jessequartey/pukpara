import { ArrowLeft, FileText, MapPin, User } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function FarmerProfilePage({
	params,
}: {
	params: Promise<{ orgId: string; farmerId: string }>;
}) {
	const { orgId, farmerId } = await params;
	const basePath = `/app/${orgId}`;
	const farmersPath = `${basePath}/farmers`;
	const decodedFarmerId = decodeURIComponent(farmerId);

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: farmersPath,
					icon: ArrowLeft,
					label: "Back to farmers",
				}}
				breadcrumbs={[
					{ label: "Organization", href: basePath },
					{ label: "Farmers", href: farmersPath },
					{ label: decodedFarmerId },
				]}
				description="Overview of farmer identity, compliance, and performance."
				title={`Farmer: ${decodedFarmerId}`}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<section className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
					<header className="flex items-center gap-3">
						<User aria-hidden="true" className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-base">Profile summary</h3>
					</header>
					<p className="mt-3 text-muted-foreground text-sm">
						Profile attributes, contact information, and cooperative membership
						details will render here.
					</p>
				</section>
				<section className="rounded-xl border bg-card p-6 shadow-sm">
					<header className="flex items-center gap-3">
						<FileText aria-hidden="true" className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-base">Compliance status</h3>
					</header>
					<p className="mt-3 text-muted-foreground text-sm">
						Onboarding documents, approvals, and risk flags will appear here.
					</p>
				</section>
			</div>

			<section className="rounded-xl border bg-card p-6 shadow-sm">
				<header className="flex items-center gap-3">
					<MapPin aria-hidden="true" className="h-5 w-5 text-primary" />
					<h3 className="font-semibold text-base">Farms snapshot</h3>
				</header>
				<p className="mt-3 text-muted-foreground text-sm">
					Linked farms, locations, and production history will be summarized in
					this table.
				</p>
			</section>
		</div>
	);
}
