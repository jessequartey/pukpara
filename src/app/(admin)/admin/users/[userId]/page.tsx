import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: "/admin/users",
          icon: ArrowLeft,
          label: "Back to users",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: userId },
        ]}
        description="User account insights, organizational roles, and security footprint."
        title={`User: ${userId}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PlaceholderSection
          description="Assigned organizations, roles, and access scopes will render here."
          title="Access overview"
        />
        <PlaceholderSection
          description="Session history, device trust, and security context will appear in this panel."
          title="Security"
        />
      </div>
    </div>
  );
}
