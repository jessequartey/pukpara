import { PageTitle } from "@/components/ui/page-title";
import { GroupsListPlaceholder } from "@/features/groups/components/groups-list-placeholder";

export default async function OrgGroupsPage({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;
	const basePath = `/app/${orgId}`;
	const listPath = `${basePath}/groups`;

	return (
		<div className="space-y-8">
			<PageTitle
				action={{ href: `${listPath}/create`, label: "Create group" }}
				breadcrumbs={[
					{ label: "Organization", href: basePath },
					{ label: "Groups" },
				]}
				description="Manage cohorts, teams, and collective farmer groupings."
				title="Groups"
			/>

			<GroupsListPlaceholder />
		</div>
	);
}
