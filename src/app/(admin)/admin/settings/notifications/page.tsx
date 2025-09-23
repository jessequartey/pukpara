import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminSettingsNotificationsPage() {
	const basePath = "/admin/settings";

	return (
		<div className="space-y-8">
			<PageTitle
				action={{
					href: `${basePath}/notifications?edit=true`,
					label: "Configure notifications",
				}}
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Settings", href: basePath },
					{ label: "Notifications" },
				]}
				description="Notification channels, templates, and delivery strategy."
				title="Notifications"
			/>

			<PlaceholderSection
				description="SMS, email, and in-app notification templates will be managed from this panel."
				title="Channels"
			/>
		</div>
	);
}
