import { OrganizationDetailsPage } from "@/features/admin/organizations/pages/organization-details-page";

type OrganizationRouteParams = {
  params: { organizationId: string };
};

export default function AdminOrganizationDetailPage({
  params,
}: OrganizationRouteParams) {
  const organizationId = decodeURIComponent(params.organizationId);
  return <OrganizationDetailsPage organizationId={organizationId} />;
}
