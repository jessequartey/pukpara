import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: "/admin/payments?record=new", label: "Record payment" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Payments" },
        ]}
        description="All platform payments, payouts, and reconciliation status."
        title="Payments"
      />

      <PlaceholderSection
        description="Payment ledger with filters for status, method, and tenant attribution will render here."
        title="Payments ledger"
      />
    </div>
  );
}
