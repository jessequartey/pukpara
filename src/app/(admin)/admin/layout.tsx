import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireApprovedSession } from "@/lib/auth-server";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const guard = await requireApprovedSession();

  if (!guard.session) {
    if (guard.reason === "PENDING_APPROVAL") {
      redirect("/pending-approval");
    }

    redirect("/sign-in");
  }

  const userRecord = guard.session.user as
    | {
        role?: unknown;
        roles?: unknown;
        admin?: { roles?: unknown };
      }
    | undefined;
  const roleField = userRecord?.role;
  const directRole = typeof roleField === "string" ? roleField : null;
  const rolesField = userRecord?.roles;
  const arrayRoles = Array.isArray(rolesField)
    ? rolesField.filter((role): role is string => typeof role === "string")
    : [];
  const adminField = userRecord?.admin;
  const pluginRolesRaw = adminField?.roles;
  const pluginRoles = Array.isArray(pluginRolesRaw)
    ? pluginRolesRaw.filter((role): role is string => typeof role === "string")
    : [];

  const rolesToCheck = [directRole, ...arrayRoles, ...pluginRoles].filter(
    (role): role is string => typeof role === "string" && role.length > 0
  );
  const adminRoles = new Set(["admin", "supportAdmin", "userAc"]);
  const isAdmin = rolesToCheck.some((role) => adminRoles.has(role));

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <DashboardLayout
      navGroups={[
        {
          title: "Platform",
          items: [
            {
              title: "Overview",
              href: "/admin",
              icon: "BarChart3",
              description: "System health and KPIs",
            },
            {
              title: "Organizations",
              href: "/admin/organizations",
              icon: "Building2",
              description: "Manage organizations and approvals",
            },
            {
              title: "Users",
              href: "/admin/users",
              icon: "Users",
              description: "Platform user directory",
            },
            {
              title: "Farmers",
              href: "/admin/farmers",
              icon: "Tractor",
              description: "Global farmer explorer",
            },
          ],
        },
        {
          title: "Operations",
          items: [
            {
              title: "Payments",
              href: "/admin/payments",
              icon: "CreditCard",
              description: "Transactions and settlements",
            },
            {
              title: "Inventory",
              href: "/admin/inventory/commodities",
              icon: "Boxes",
              description: "Commodity catalog",
            },
            {
              title: "Marketplace",
              href: "/admin/marketplace/listings",
              icon: "Store",
              description: "Listings and purchase orders",
            },
          ],
        },
        {
          title: "Governance",
          items: [
            {
              title: "Settings",
              href: "/admin/settings",
              icon: "Settings",
              description: "Platform configuration",
            },
            {
              title: "Audit",
              href: "/admin/audit",
              icon: "FileText",
              description: "System-wide audit log",
            },
          ],
        },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
