import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantSavingsPageProps = {
  params: { tenantId: string };
};

export default function TenantSavingsPage({ params }: TenantSavingsPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);
  const basePath = `/admin/tenants/${params.tenantId}`;
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
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId, href: basePath },
          { label: "Finance" },
          { label: "Savings" },
        ]}
        description="Tenant savings programs, balances, and reconciliation status."
        title="Savings"
      />

      <PlaceholderSection
        description="Product lineup, aggregate balances, and delinquency metrics will render here."
        title="Savings overview"
      />
    </div>
  );
}
