import { PageTitle } from "@/components/ui/page-title";
import { MembersDirectoryCard } from "@/features/organization/members/components/members-directory-card";

export default async function OrgMembersPage() {
	return (
		<div className="space-y-8">
			<PageTitle
				action={{ href: "/members/invite", label: "Invite member" }}
				breadcrumbs={[
					{ label: "Organization", href: "/" },
					{ label: "Members" },
				]}
				description="Manage organization members, roles, and permissions."
				title="Members"
			/>

			<MembersDirectoryCard />
		</div>
	);
}
