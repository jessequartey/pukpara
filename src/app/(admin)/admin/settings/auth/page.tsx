import { PageTitle } from "@/components/ui/page-title";
import { PlaceholderSection } from "@/features/admin/components/placeholder-section";

export default function AdminSettingsAuthPage() {
  const basePath = "/admin/settings";

  return (
    <div className="space-y-8">
      <PageTitle
        action={{
          href: `${basePath}/auth?edit=true`,
          label: "Update policies",
        }}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: basePath },
          { label: "Authentication" },
        ]}
        description="Authentication policies, session management, and invitation controls."
        title="Authentication"
      />

      <PlaceholderSection
        description="Session lifetime, MFA requirements, and geo-blocking rules will appear here."
        title="Policy overview"
      />
    </div>
  );
}
