"use client";

import { Edit, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrganizationOverviewCard() {
	// Mock data - replace with actual API call
	const overview = {
		type: "cooperative",
		subtype: "farmer",
		createdAt: "2024-01-15T10:30:00Z",
		planRenewsAt: "2024-12-15T23:59:59Z",
		maxUsers: 100,
		timezone: "Africa/Accra",
		defaultCurrency: "GHS",
		ussdShortCode: "*920*123#",
		smsSenderId: "GREENVAL",
		limits: {
			teams: 10,
			warehouses: 5,
			farmers: 500,
		},
		stats: {
			members: 45,
			teams: 3,
			farmers: 127,
			warehouses: 2,
		},
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Organization Overview</CardTitle>
					<div className="flex items-center gap-2">
						<Button size="sm" variant="outline">
							<Settings className="mr-2 size-4" />
							Manage Limits
						</Button>
						<Button size="sm" variant="outline">
							<Edit className="mr-2 size-4" />
							Edit Details
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Basic Info */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<dt className="font-medium text-muted-foreground text-sm">Type</dt>
						<dd className="text-sm">
							{overview.type} / {overview.subtype}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Created
						</dt>
						<dd className="text-sm">{formatDate(overview.createdAt)}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Plan Renews
						</dt>
						<dd className="text-sm">{formatDate(overview.planRenewsAt)}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Max Users
						</dt>
						<dd className="text-sm">{overview.maxUsers}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Timezone
						</dt>
						<dd className="text-sm">{overview.timezone}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Currency
						</dt>
						<dd className="text-sm">{overview.defaultCurrency}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							USSD Code
						</dt>
						<dd className="font-mono text-sm">{overview.ussdShortCode}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							SMS Sender ID
						</dt>
						<dd className="font-mono text-sm">{overview.smsSenderId}</dd>
					</div>
				</div>

				{/* Feature Limits */}
				<div>
					<h4 className="mb-3 font-medium text-sm">Feature Limits</h4>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">Teams: {overview.limits.teams}</Badge>
						<Badge variant="secondary">
							Warehouses: {overview.limits.warehouses}
						</Badge>
						<Badge variant="secondary">
							Farmers: {overview.limits.farmers}
						</Badge>
					</div>
				</div>

				{/* Quick Stats */}
				<div>
					<h4 className="mb-3 font-medium text-sm">Quick Stats</h4>
					<div className="grid grid-cols-4 gap-4">
						<div className="text-center">
							<div className="font-bold text-2xl text-blue-600">
								{overview.stats.members}
							</div>
							<div className="text-muted-foreground text-xs">Members</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-green-600">
								{overview.stats.teams}
							</div>
							<div className="text-muted-foreground text-xs">Teams</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-orange-600">
								{overview.stats.farmers}
							</div>
							<div className="text-muted-foreground text-xs">Farmers</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-purple-600">
								{overview.stats.warehouses}
							</div>
							<div className="text-muted-foreground text-xs">Warehouses</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
