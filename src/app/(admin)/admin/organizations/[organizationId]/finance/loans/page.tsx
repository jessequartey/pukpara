import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

type OrganizationLoansPageProps = {
  params: { organizationId: string };
};

export default function OrganizationLoansPage({
  params,
}: OrganizationLoansPageProps) {
  const organizationId = decodeURIComponent(params.organizationId);
  const basePath = `/admin/organizations/${params.organizationId}`;
  const financePath = `${basePath}/finance`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${financePath}/loans?create=new`,
          label: "Create loan",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationId, href: basePath },
          { label: "Finance" },
          { label: "Loans" },
        ]}
        description="Loan portfolio insights for the selected organization."
        title="Loans"
      />

      <PlaceholderSection
        description="Disbursement, repayment, and delinquency analytics will populate this view."
        title="Loan overview"
      />
    </div>
  );
}
