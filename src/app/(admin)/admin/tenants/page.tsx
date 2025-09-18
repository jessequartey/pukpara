import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

export default function AdminTenantsPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: "/admin/tenants?create=new", label: "Create tenant" }}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Tenants" }]}
        description="Search and manage tenant organizations across the platform."
        title="Tenants"
      />

      <PlaceholderSection
        description="Tenant directory with filters, lifecycle states, and bulk actions will display here."
        title="Tenant list"
      />
    </div>
  );
}
