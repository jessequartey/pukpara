import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationFarmersPageProps = {
  params: { organizationId: string };
};

export default function OrganizationFarmersPage({
  params,
}: OrganizationFarmersPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/farmers?create=new`, label: "Add farmer" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Farmers" },
        ]}
        description="Explore all farmers under this organization organization."
        title="Farmers"
      />

      <PlaceholderSection
        description="Enrollment status, farm counts, and verification timeline will render here."
        title="Organization farmers"
      />
    </div>
  );
}
