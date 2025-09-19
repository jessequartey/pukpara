import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const decodedPaymentId = decodeURIComponent(paymentId);

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: "/admin/payments",
          icon: ArrowLeft,
          label: "Back to payments",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Payments", href: "/admin/payments" },
          { label: decodedPaymentId },
        ]}
        description="Payment details, reconciliation status, and activity timeline."
        title={`Payment: ${decodedPaymentId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Transaction metadata, amounts, and associated parties will surface here."
          title="Transaction details"
        />
        <PlaceholderSection
          description="Settlement timeline, ledger sync, and audit notes will appear in this panel."
          title="Reconciliation"
        />
      </div>
    </div>
  );
}
