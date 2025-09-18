import { PageTitle } from "@/components/ui/page-title";

type OrgSettingsPageProps = {
  params: { orgId: string };
};

export default function OrgSettingsPage({ params }: OrgSettingsPageProps) {
  const basePath = `/app/${params.orgId}`;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: `${basePath}/groups/create`, label: "Invite member" }}
        breadcrumbs={[
          { label: "Organization", href: basePath },
          { label: "Settings" },
        ]}
        description="Control organization preferences, approvals, and notifications."
        title="Settings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base">Profile and contact</h3>
          <p className="mt-3 text-muted-foreground text-sm">
            Company details, contacts, and billing information will be editable
            here.
          </p>
        </section>
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base">Access and workflows</h3>
          <p className="mt-3 text-muted-foreground text-sm">
            Role policies, approvals, and automation preferences will surface in
            this section.
          </p>
        </section>
      </div>
    </div>
  );
}
