import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";

export default async function CreateFarmerPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const basePath = `/app/${orgId}`;
  const listPath = `${basePath}/farmers`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: listPath,
          icon: ArrowLeft,
          label: "Back to farmers",
        }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Farmers", href: listPath },
          { label: "Create" },
        ]}
        description="Capture farmer profile details, contact information, and onboarding docs."
        title="Register farmer"
      />

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          A step-driven registration experience will guide field officers
          through required data points, uploads, and verification tasks.
        </p>
      </section>
    </div>
  );
}
