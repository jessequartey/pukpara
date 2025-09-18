import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

type VarietyDetailPageProps = {
  params: { varietyId: string };
};

export default function VarietyDetailPage({ params }: VarietyDetailPageProps) {
  const varietyId = decodeURIComponent(params.varietyId);
  const basePath = "/admin/inventory";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/varieties`,
          icon: ArrowLeft,
          label: "Back to varieties",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: `${basePath}/commodities` },
          { label: "Varieties", href: `${basePath}/varieties` },
          { label: varietyId },
        ]}
        description="Variety definitions, climate suitability, and best practices."
        title={`Variety: ${varietyId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Recommended conditions, maturation period, and yield potential will render here."
          title="Agronomy"
        />
        <PlaceholderSection
          description="Input schedules, cost curves, and support materials will populate this panel."
          title="Guidance"
        />
      </div>
    </div>
  );
}
