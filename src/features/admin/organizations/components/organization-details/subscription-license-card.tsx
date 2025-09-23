"use client";

import { CreditCard, FileText, RotateCcw, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubscriptionLicenseCard() {
	// Mock data - replace with actual API call
	const subscription = {
		subscriptionType: "premium",
		licenseStatus: "issued" as const,
		renewalDate: "2024-12-15T23:59:59Z",
		billingEmail: "billing@greenvalley.coop",
		taxId: "TIN-123456789",
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getPlanBadge = (type: string) => {
		switch (type) {
			case "premium":
				return <Badge variant="default">Premium</Badge>;
			case "standard":
				return <Badge variant="secondary">Standard</Badge>;
			case "basic":
				return <Badge variant="outline">Basic</Badge>;
			default:
				return <Badge variant="outline">Free</Badge>;
		}
	};

	const getLicenseBadge = (status: string) => {
		switch (status) {
			case "issued":
				return <Badge variant="default">Issued</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "revoked":
				return <Badge variant="destructive">Revoked</Badge>;
			default:
				return <Badge variant="outline">Not Issued</Badge>;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Subscription & License</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Plan and License Status */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<dt className="font-medium text-muted-foreground text-sm">Plan</dt>
						<dd className="mt-1">
							{getPlanBadge(subscription.subscriptionType)}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							License
						</dt>
						<dd className="mt-1">
							{getLicenseBadge(subscription.licenseStatus)}
						</dd>
					</div>
				</div>

				{/* Billing Information */}
				<div className="space-y-3">
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Renewal Date
						</dt>
						<dd className="text-sm">{formatDate(subscription.renewalDate)}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Billing Email
						</dt>
						<dd className="text-sm">{subscription.billingEmail}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">
							Tax ID
						</dt>
						<dd className="font-mono text-sm">{subscription.taxId}</dd>
					</div>
				</div>

				{/* Actions */}
				<div className="border-t pt-4">
					<div className="grid grid-cols-2 gap-2">
						<Button size="sm" variant="outline">
							<Shield className="mr-2 size-4" />
							Issue License
						</Button>
						<Button size="sm" variant="outline">
							<RotateCcw className="mr-2 size-4" />
							Revoke
						</Button>
						<Button size="sm" variant="outline">
							<FileText className="mr-2 size-4" />
							Send Invoice
						</Button>
						<Button size="sm" variant="outline">
							<CreditCard className="mr-2 size-4" />
							Change Plan
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
