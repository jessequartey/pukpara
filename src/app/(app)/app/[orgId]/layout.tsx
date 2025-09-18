import { BarChart3, Layers3, Settings, Tractor } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireApprovedSession } from "@/lib/auth-server";

type OrgLayoutProps = {
  children: ReactNode;
  params: { orgId: string };
};

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const guard = await requireApprovedSession();

  if (!guard.session) {
    if (guard.reason === "PENDING_APPROVAL") {
      redirect("/pending-approval");
    }

    redirect("/sign-in");
  }

  const basePath = `/app/${params.orgId}`;

  return (
    <DashboardLayout
      navGroups={[
        {
          title: "Organization",
          items: [
            {
              title: "Overview",
              href: basePath,
              icon: BarChart3,
              description: "Organization health and activity",
            },
            {
              title: "Groups",
              href: `${basePath}/groups`,
              icon: Layers3,
              description: "Member teams and cohorts",
            },
            {
              title: "Farmers",
              href: `${basePath}/farmers`,
              icon: Tractor,
              description: "Farmers and farms overview",
            },
            {
              title: "Settings",
              href: `${basePath}/settings`,
              icon: Settings,
              description: "Organization preferences",
            },
          ],
        },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
