import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function CreateGroupPage() {
	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: "/groups",
					icon: ArrowLeft,
					label: "Back to groups",
				}}
				breadcrumbs={[
					{ label: "Organization", href: "/" },
					{ label: "Groups", href: "/groups" },
					{ label: "Create" },
				]}
				description="Set up a new farmer or savings group, assign leads, and manage enrollment."
				title="Create group"
			/>

			<section className="rounded-xl border bg-card p-6 shadow-sm">
				<p className="text-muted-foreground text-sm">
					Form fields for group creation will be implemented here. Capture
					metadata, locations, and lead assignments.
				</p>
			</section>
		</div>
	);
}
