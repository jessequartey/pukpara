import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireApprovedSession } from "@/lib/auth-server";

export default async function OrgLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ orgId: string }>;
}) {
	const guard = await requireApprovedSession();

	if (!guard.session) {
		if (guard.reason === "PENDING_APPROVAL") {
			redirect("/pending-approval");
		}

		redirect("/sign-in");
	}

	const { orgId } = await params;
	const basePath = `/app/${orgId}`;

	return (
		<DashboardLayout
			navGroups={[
				{
					title: "Organization",
					items: [
						{
							title: "Overview",
							href: basePath,
							icon: "TrendingUp",
							description: "Organization health and activity",
						},
						{
							title: "Groups",
							href: `${basePath}/groups`,
							icon: "Layers",
							description: "Member teams and cohorts",
						},
						{
							title: "Farmers",
							href: `${basePath}/farmers`,
							icon: "Tractor",
							description: "Farmers and farms overview",
						},
						{
							title: "Settings",
							href: `${basePath}/settings`,
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
