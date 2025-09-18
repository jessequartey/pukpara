import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminSettingsBillingPage() {
  const basePath = "/admin/settings";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/billing?edit=true`,
          label: "Edit billing",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: basePath },
          { label: "Billing" },
        ]}
        description="Plans, pricing, and invoicing configuration."
        title="Billing"
      />

      <PlaceholderSection
        description="Subscription plans, pricing tiers, and overage handling will be configured here."
        title="Plan management"
      />
    </div>
  );
}
