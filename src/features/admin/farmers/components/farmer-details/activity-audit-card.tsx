"use client";

import {
	Activity,
	Calendar,
	CreditCard,
	DollarSign,
	FileText,
	Sprout,
	User,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type ActivityAuditCardProps = {
	farmerId: string;
};

type AuditEntry = {
	id: string;
	action: string;
	entity: string;
	details: string;
	performedBy: string;
	performedAt: string;
	category: "profile" | "savings" | "loan" | "membership" | "farm" | "kyc";
	metadata?: Record<string, unknown>;
};

export function ActivityAuditCard({ farmerId }: ActivityAuditCardProps) {
	// Mock audit log data - replace with actual API call
	const auditEntries: AuditEntry[] = [
		{
			id: "1",
			action: "profile_updated",
			entity: `farmer:${farmerId}`,
			details: "Phone number updated from +233541234566 to +233541234567",
			performedBy: "Sarah Johnson",
			performedAt: "2024-03-15T10:30:00Z",
			category: "profile",
			metadata: {
				field: "phone",
				oldValue: "+233541234566",
				newValue: "+233541234567",
			},
		},
		{
			id: "2",
			action: "savings_entry_recorded",
			entity: `savings:${farmerId}`,
			details: "Monthly contribution of GHS 150.00 recorded for VSLA account",
			performedBy: "System",
			performedAt: "2024-03-15T09:15:00Z",
			category: "savings",
			metadata: {
				amount: 150.0,
				currency: "GHS",
				type: "contribution",
				accountId: "VSLA-001-2024",
			},
		},
		{
			id: "3",
			action: "loan_application_submitted",
			entity: `loan:${farmerId}`,
			details: "Agricultural loan application submitted for GHS 2,500.00",
			performedBy: "Kofi Asante",
			performedAt: "2024-02-10T11:20:00Z",
			category: "loan",
			metadata: {
				loanId: "LOAN-2024-002",
				amount: 2500.0,
				currency: "GHS",
				purpose: "Agricultural inputs",
			},
		},
		{
			id: "4",
			action: "team_membership_added",
			entity: `membership:${farmerId}`,
			details: "Added to Young Farmers Network as Secretary",
			performedBy: "Michael Asante",
			performedAt: "2024-01-25T14:45:00Z",
			category: "membership",
			metadata: {
				teamName: "Young Farmers Network",
				role: "secretary",
				teamId: "team-456",
			},
		},
		{
			id: "5",
			action: "farm_registered",
			entity: `farm:${farmerId}`,
			details:
				"New farm registered: Secondary Plantation (3.8 acres, Oil Palm)",
			performedBy: "Field Officer",
			performedAt: "2024-01-20T16:30:00Z",
			category: "farm",
			metadata: {
				farmName: "Secondary Plantation",
				acreage: 3.8,
				cropType: "Oil Palm",
				farmId: "farm-789",
			},
		},
		{
			id: "6",
			action: "kyc_status_updated",
			entity: `farmer:${farmerId}`,
			details: "KYC status changed from pending to verified",
			performedBy: "KYC System",
			performedAt: "2024-01-16T12:00:00Z",
			category: "kyc",
			metadata: {
				oldStatus: "pending",
				newStatus: "verified",
				verificationMethod: "manual_review",
			},
		},
		{
			id: "7",
			action: "loan_repayment_made",
			entity: `loan:${farmerId}`,
			details: "Loan repayment of GHS 500.00 processed for LOAN-2023-015",
			performedBy: "Payment System",
			performedAt: "2024-01-15T08:30:00Z",
			category: "loan",
			metadata: {
				loanId: "LOAN-2023-015",
				amount: 500.0,
				currency: "GHS",
				paymentMethod: "mobile_money",
			},
		},
		{
			id: "8",
			action: "profile_created",
			entity: `farmer:${farmerId}`,
			details: "Farmer profile created during registration",
			performedBy: "Registration System",
			performedAt: "2023-01-15T10:30:00Z",
			category: "profile",
			metadata: {
				registrationSource: "field_agent",
				agentId: "agent-123",
			},
		},
	];

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "profile":
				return <User className="h-4 w-4 text-blue-600" />;
			case "savings":
				return <DollarSign className="h-4 w-4 text-green-600" />;
			case "loan":
				return <CreditCard className="h-4 w-4 text-orange-600" />;
			case "membership":
				return <Users className="h-4 w-4 text-purple-600" />;
			case "farm":
				return <Sprout className="h-4 w-4 text-emerald-600" />;
			case "kyc":
				return <FileText className="h-4 w-4 text-red-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	const getCategoryVariant = (category: string) => {
		switch (category) {
			case "profile":
				return "default";
			case "savings":
				return "default";
			case "loan":
				return "secondary";
			case "membership":
				return "outline";
			case "farm":
				return "default";
			case "kyc":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getActionDescription = (entry: AuditEntry) => {
		switch (entry.action) {
			case "profile_updated":
				return "Profile information was modified";
			case "savings_entry_recorded":
				return "Savings transaction was recorded";
			case "loan_application_submitted":
				return "Loan application was submitted";
			case "loan_repayment_made":
				return "Loan repayment was processed";
			case "team_membership_added":
				return "Added to a team/group";
			case "team_membership_removed":
				return "Removed from a team/group";
			case "farm_registered":
				return "New farm was registered";
			case "farm_updated":
				return "Farm information was updated";
			case "kyc_status_updated":
				return "KYC verification status changed";
			case "profile_created":
				return "Farmer profile was created";
			default:
				return entry.action.replace(/_/g, " ");
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					Activity & Audit
				</CardTitle>
				<CardDescription>
					Recent activities and system audit trail ({auditEntries.length}{" "}
					entries)
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{auditEntries.map((entry) => (
						<div
							className="flex items-start gap-4 rounded-lg border p-4"
							key={entry.id}
						>
							<div className="mt-1">{getCategoryIcon(entry.category)}</div>
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-2">
									<Badge variant={getCategoryVariant(entry.category)}>
										{entry.category}
									</Badge>
									<span className="font-medium text-sm">
										{getActionDescription(entry)}
									</span>
								</div>
								<p className="text-muted-foreground text-sm">{entry.details}</p>
								<div className="flex items-center gap-4 text-muted-foreground text-xs">
									<div className="flex items-center gap-1">
										<User className="h-3 w-3" />
										<span>{entry.performedBy}</span>
									</div>
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										<span>{formatDate(entry.performedAt)}</span>
									</div>
								</div>
								{entry.metadata && Object.keys(entry.metadata).length > 0 && (
									<details className="text-xs">
										<summary className="cursor-pointer text-muted-foreground hover:text-foreground">
											View metadata
										</summary>
										<div className="mt-2 rounded bg-muted p-2">
											<pre className="text-xs">
												{JSON.stringify(entry.metadata, null, 2)}
											</pre>
										</div>
									</details>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
