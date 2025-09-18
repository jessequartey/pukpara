import { PageTitle } from "@/components/ui/page-title";
import { OrganizationOverviewCards } from "@/features/organizations/components/organization-overview-cards";

type OrgOverviewPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgOverviewPage({
  params,
}: OrgOverviewPageProps) {
  const { orgId } = await params;
  const basePath = `/app/${orgId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/farmers/create`,
          label: "Add farmer",
        }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Overview" },
        ]}
        description="Track membership, production, and financial activity for this organization."
        title="Organization overview"
      />

      <OrganizationOverviewCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Recent activity</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Analytics and recent actions for this organization will appear here.
          </p>
        </section>
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Tasks</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Assign onboarding, verification, and follow ups to your team
            members.
          </p>
        </section>
      </div>
    </div>
  );
}
