import { PageTitle } from "@/components/ui/page-title";
import { GroupsDirectoryCard } from "@/features/organization/groups/components/groups-directory-card";

export default async function OrgGroupsPage() {
	return (
		<div className="space-y-8">
			<PageTitle
				action={{ href: "/groups/create", label: "Create group" }}
				breadcrumbs={[
					{ label: "Organization", href: "/" },
					{ label: "Groups" },
				]}
				description="Manage cohorts, teams, and collective farmer groupings."
				title="Groups"
			/>

			<GroupsDirectoryCard />
		</div>
	);
}
