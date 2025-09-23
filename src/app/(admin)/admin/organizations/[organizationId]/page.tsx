import { OrganizationDetailsPage } from "@/features/admin/organizations/pages/organization-details-page";

type OrganizationRouteParams = {
	params: Promise<{ organizationId: string }>;
};

export default async function AdminOrganizationDetailPage({
	params,
}: OrganizationRouteParams) {
	const { organizationId: rawId } = await params;
	const organizationId = decodeURIComponent(rawId);

	return <OrganizationDetailsPage orgId={organizationId} />;
}
