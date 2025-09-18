import { PageTitle } from "@/components/ui/page-title";
import { AdminOverviewCards } from "@/features/admin/overview/components/admin-overview-cards";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: "/admin/organizations?create=new",
          label: "Create organization",
        }}
        breadcrumbs={[{ label: "Admin overview" }]}
        description="Monitor platform-wide activity, growth, and operations."
        title="Admin dashboard"
      />

      <AdminOverviewCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Alerts on pending approvals, subscription renewals, and compliance tasks will surface here."
          title="Operational alerts"
        />
        <PlaceholderSection
          description="Revenue, collection, and payout trends will power finance insights."
          title="Financial trends"
        />
      </div>
    </div>
  );
}
