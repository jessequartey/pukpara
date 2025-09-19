type OrganizationRouteParams = {
  params: Promise<{ organizationId: string }>;
};

export default async function AdminOrganizationDetailPage({
  params,
}: OrganizationRouteParams) {
  const { organizationId: rawId } = await params;
  const organizationId = decodeURIComponent(rawId);
  return <div>{organizationId} page</div>;
}
