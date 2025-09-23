"use client";

import { OrganizationDirectoryCard } from "@/features/admin/organizations/components/organization-directory/organization-directory-card";
import { OrganizationPageTitle } from "@/features/admin/organizations/components/organization-page-title";
import { useOrganizationListController } from "@/features/admin/organizations/hooks/use-organization-list-controller";

export function OrganizationsPage() {
	const controller = useOrganizationListController();

	return (
		<OrganizationPageTitle
			action={{ label: "New organization", href: "/admin/organizations/new" }}
			description="Review onboarding progress, lifecycle states, and licensing across every organization."
			title="Organizations"
		>
			<OrganizationDirectoryCard controller={controller} />
		</OrganizationPageTitle>
	);
}

export default OrganizationsPage;
