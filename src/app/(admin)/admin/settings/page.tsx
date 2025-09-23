import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminSettingsPage() {
	const basePath = "/admin/settings";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{ href: `${basePath}?edit=true`, label: "Edit settings" }}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Settings" },
				]}
				description="Platform defaults, policies, and integrations."
				title="Settings"
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<PlaceholderSection
					description="Notification providers, email templates, and escalation rules."
					title="Notifications"
				/>
				<PlaceholderSection
					description="Access policies, password requirements, and session strategy."
					title="Authentication"
				/>
			</div>
		</div>
	);
}
