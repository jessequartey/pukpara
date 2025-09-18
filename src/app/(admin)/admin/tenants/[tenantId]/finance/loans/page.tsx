import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantLoansPageProps = {
  params: { tenantId: string };
};

export default function TenantLoansPage({ params }: TenantLoansPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;
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
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Finance" },
          { label: "Loans" },
        ]}
        description="Loan portfolio insights for the selected tenant."
        title="Loans"
      />

      <PlaceholderSection
        description="Disbursement, repayment, and delinquency analytics will populate this view."
        title="Loan overview"
      />
    </div>
  );
}
