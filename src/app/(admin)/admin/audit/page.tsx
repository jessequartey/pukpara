import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

export default function AdminAuditPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: "/admin/audit?export=csv", label: "Export audit log" }}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit" }]}
        description="Global audit log across tenants, users, and sensitive actions."
        title="Audit log"
      />

      <PlaceholderSection
        description="Time-series audit entries with filters and retention controls will appear here."
        title="Audit trail"
      />
    </div>
  );
}
