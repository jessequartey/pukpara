import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type TenantOverviewPageProps = {
  params: { tenantId: string };
};

export default function TenantOverviewPage({
  params,
}: TenantOverviewPageProps) {
  const tenantId = decodeURIComponent(params.tenantId);

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: "/admin/tenants",
          icon: ArrowLeft,
          label: "Back to tenants",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tenants", href: "/admin/tenants" },
          { label: tenantId },
        ]}
        description="Tenant-level metrics, licensing, and operational health."
        title={`Tenant: ${tenantId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Subscription status, limits, and plan usage will display here."
          title="Subscription summary"
        />
        <PlaceholderSection
          description="Recent activity, approvals, and compliance alerts will surface for this tenant."
          title="Operational alerts"
        />
      </div>
    </div>
  );
}
