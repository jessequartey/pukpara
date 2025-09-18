import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/overview/components/placeholder-section";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        action={{ href: "/admin/users?invite=new", label: "Invite user" }}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        description="Observe all platform users, roles, and sessions."
        title="Users"
      />

      <PlaceholderSection
        description="Global user directory with status, organization membership, and last activity will populate here."
        title="User list"
      />
    </div>
  );
}
