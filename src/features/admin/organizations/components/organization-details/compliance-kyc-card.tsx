"use client";

import { CheckCircle, Mail, Shield, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ComplianceKycCard() {
	// Mock data - replace with actual API call
	const compliance = {
		orgKyc: {
			status: "verified" as const,
			lastUpdated: "2024-01-15T10:30:00Z",
			requiredDocs: [
				{ name: "Business Registration", status: "verified", required: true },
				{ name: "Tax Certificate", status: "verified", required: true },
				{ name: "Bank Statement", status: "pending", required: true },
				{ name: "Director IDs", status: "verified", required: false },
			],
		},
		userKyc: {
			unverifiedCount: 12,
			totalUsers: 45,
			verificationRate: 73,
		},
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getKycBadge = (status: string) => {
		switch (status) {
			case "verified":
				return <Badge variant="default">Verified</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			default:
				return <Badge variant="outline">Not Started</Badge>;
		}
	};

	const getDocIcon = (status: string) => {
		switch (status) {
			case "verified":
				return <CheckCircle className="size-4 text-green-600" />;
			case "rejected":
				return <XCircle className="size-4 text-red-600" />;
			default:
				return <div className="size-4 rounded-full border-2 border-gray-300" />;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="size-4" />
					Compliance & KYC
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Organization KYC Status */}
				<div>
					<div className="mb-3 flex items-center justify-between">
						<div>
							<h4 className="font-medium text-sm">Organization KYC</h4>
							<p className="text-muted-foreground text-xs">
								Last updated: {formatDate(compliance.orgKyc.lastUpdated)}
							</p>
						</div>
						{getKycBadge(compliance.orgKyc.status)}
					</div>

					{/* Required Documents Checklist */}
					<div className="space-y-2">
						{compliance.orgKyc.requiredDocs.map((doc) => (
							<div className="flex items-center gap-3" key={doc.name}>
								{getDocIcon(doc.status)}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="text-sm">{doc.name}</span>
										{doc.required && (
											<span className="text-red-500 text-xs">*</span>
										)}
									</div>
								</div>
								<div className="text-muted-foreground text-xs">
									{doc.status}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* User KYC Summary */}
				<div className="border-t pt-4">
					<h4 className="mb-2 font-medium text-sm">User Verification</h4>
					<div className="rounded-lg border p-3">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm">Verification Rate</span>
							<span className="font-medium text-sm">
								{compliance.userKyc.verificationRate}%
							</span>
						</div>
						<div className="mb-2 h-2 w-full rounded-full bg-gray-200">
							<div
								className="h-2 rounded-full bg-green-500"
								style={{ width: `${compliance.userKyc.verificationRate}%` }}
							/>
						</div>
						<div className="text-muted-foreground text-xs">
							{compliance.userKyc.unverifiedCount} of{" "}
							{compliance.userKyc.totalUsers} users need verification
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-2">
					<Button className="w-full" size="sm" variant="outline">
						<Mail className="mr-2 size-4" />
						Request Documents
					</Button>
					<Button className="w-full" size="sm">
						<Shield className="mr-2 size-4" />
						Mark Verified
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
