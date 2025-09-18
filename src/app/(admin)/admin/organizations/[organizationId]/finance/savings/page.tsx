import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationSavingsPageProps = {
  params: { organizationId: string };
};

export default function OrganizationSavingsPage({
  params,
}: OrganizationSavingsPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;
  const financePath = `${basePath}/finance`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${financePath}/savings?create=new`,
          label: "Add savings product",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Finance" },
          { label: "Savings" },
        ]}
        description="Organization savings programs, balances, and reconciliation status."
        title="Savings"
      />

      <PlaceholderSection
        description="Product lineup, aggregate balances, and delinquency metrics will render here."
        title="Savings overview"
      />
    </div>
  );
}
