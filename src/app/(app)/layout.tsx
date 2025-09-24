import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireApprovedSession } from "@/lib/auth-server";

export default async function OrgLayout({ children }: { children: ReactNode }) {
	const guard = await requireApprovedSession();

	if (!guard.session) {
		if (guard.reason === "PENDING_APPROVAL") {
			redirect("/pending-approval");
		}

		redirect("/sign-in");
	}

	return (
		<DashboardLayout
			navGroups={[
				{
					title: "Organization",
					items: [
						{
							title: "Overview",
							href: "/",
							icon: "TrendingUp",
							description: "Organization health and activity",
						},
						{
							title: "Members",
							href: "/members",
							icon: "Users",
							description: "Organization members and roles",
						},
						{
							title: "Groups",
							href: "/groups",
							icon: "Layers",
							description: "Member teams and cohorts",
						},
						{
							title: "Farmers",
							href: "/farmers",
							icon: "Tractor",
							description: "Farmers and farms overview",
						},
						{
							title: "Settings",
							href: "/settings",
							icon: "Settings",
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
